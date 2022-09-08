// null are removed from arrays statistics !

// Helpers
const pluck = (arr, key) => arr.map(r => r[key])
const isNotObject = (oo) => ['boolean', 'string', 'number', 'undefined', 'function'].indexOf(typeof (oo)) >= 0
const intersect = (ob1, obj2) => ob1.filter(v => obj2.includes(v));
const isFloat = (n) => n === +n && n !== (n | 0)
const asc = arr => arr.sort((a, b) => a - b);
const sum = arr => arr.reduce((a, b) => a + b, 0);
const mean = arr => sum(arr) / arr.length;
// sample standard deviation
const std = (arr) => {
    const mu = mean(arr);
    const diffArr = arr.map(a => (a - mu) ** 2);
    return Math.sqrt(sum(diffArr) / (arr.length - 1));
}
const quantile = (arr, q) => {
    const sorted = asc(arr);
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sorted[base + 1] !== undefined) {
        return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    } else {
        return sorted[base];
    }
}
const q25 = arr => quantile(arr, .25);
const q50 = arr => quantile(arr, .50);
const q75 = arr => quantile(arr, .75);

let movingAvg = (val, oldAvg, n) => oldAvg * (n - 1) / n + val / n

/**
 * 
 * @param {Boolean} streaming whether to expect a stream of JSON (NDJson) or a regular one
 */
function ObjectStatistics(streaming = false) {

    this.streaming = streaming
    this.memory = {}

    this.lazyPluck = (obj) => {
        for (const property in obj) {
            const value = obj[property]
            if (this.memory[property]) {
                this.memory[property].count += 1
                this.memory[property].avg = movingAvg(value, this.memory[property].avg, this.memory[property].count)
                if (value > this.memory[property].max) this.memory[property].max = value
                if (value < this.memory[property].min) this.memory[property].min = value
            }
            else if (typeof (value) === 'number')
                this.memory[property] = {
                    count: 0,
                    avg: 0,
                    min: Infinity,
                    max: -Infinity
                }
        }
    }

    // Get any (with the limitation above) object statistics (like Python/Pandas DataFrame#summary method)
    this._getStats = (object, key = '__roo_t_', first = true) => {
        this.lazyPluck(object)
        if (first && isNotObject(object)) return { type: typeof (object) }
        else if (isNotObject(object)) return { type: typeof (object) === 'number' ? (isFloat(object) ? 'float' : 'integer') : typeof (object) }
        const isArray = Array.isArray(object)
        if (first && isArray) return null
        let mixed = false
        if (isArray) {
            object = object.filter(el => el != null)
            mixed = new Set(object.map(o => typeof (o))).size == 2
        }
        let min, intersection
        // isNaN([1,2,5,"101k"]) == NaN && isNaN(NaN) == true // A fast correct way to check if an array is numbers 
        // either infered from string or plain numbers (mixed or not)
        if (isArray && !isNaN(min = Math.min.apply(null, object))) {
            // true -> 1 & "1001" is 1001
            object = object.map(Number)
            const ret = {
                type: mixed ? `array:number:infered` : 'array:number',
                count: object.length,
                mean: object.reduce((a, b) => a + b, 0) / object.length,
                std: std(object),
                min: Math.min.apply(null, object),
                q25: q25(object),
                median: q50(object),
                q75: q75(object),
                max: Math.max.apply(null, object),
            }
            return ret
        } else if (isArray && object.length > 1 && object.every(isNotObject)) {
            const ret = {
                type: 'array:nan',
                count: object.length,
                unique: new Set(object).size
            }
            return ret
        } else if (isArray && object.length > 1 && (intersection = intersect(Object.keys(object[0]), Object.keys(object[1]))).length) {
            const ret = {}
            for (let index = 0; index < intersection.length; index++) {
                const key = intersection[index]
                const arr = pluck(object, key)
                ret[`${key}`] = this.getStats(arr, key, false)
            }
            return ret
        }
        const finalResult = {}
        for (const property in object) {
            const value = object[property]
            finalResult[`${property}`] = this.getStats(value, property, false)
        }
        return finalResult
    }

    if (this.streaming) {
        this.getStats = (newObject) => {
            // console.log(`getting stats of obj:: ${JSON.stringify(newObject)}`)
            return this._getStats(newObject, '__roo_t_', true)
        }
    } else {
        this.getStats = (newObject) => {
            // console.log(`getting stats of obj:: ${JSON.stringify(newObject)}`)
            return this._getStats(newObject, '__roo_t_', true)
        }
    }
}


export default ObjectStatistics;