// null are removed from arrays statistics !

// Helpers
const pluck = (arr, key) => arr.map(r => r[key])
const isObject = (oo) => ['boolean', 'string', 'number', 'undefined', 'function'].indexOf(typeof (oo)) < 0
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
// let movingStd = (totalPow2, total, n) => Math.sqrt((n * totalPow2 - total * total) / (n * (n - 1)))

// Welford's algorithm: from https://en.wikipedia.org/wiki/Algorithms_for_calculating_variance
let onlineVariance = (x, n = 1, mean = 0, M2 = 0) => {
    let delta = x - mean
    mean += delta / n
    M2 += delta * (x - mean)
    return { result: M2 / (n - 1), mean, M2, msg: 'Ignore. This is not part of results.' }
}


/**
 * 
 * @param {Boolean} streaming whether to expect a stream of JSON (NDJson) or a regular object
 */
function ObjectStatistics(streaming = false) {

    this.streaming = streaming
    this.memory = {}

    class lazyPluckObject extends Object {
        constructor() {
            super()
            this.count = 0;
            this.sum = 0;
            this.avg = 0;
            this.var = { avg: 0, M2: 0, msg: 'Ignore "this.var". It is not part of results.' };
            this.min = Infinity;
            this.max = -Infinity;
        }
    }
    this.lazyPluck = (obj) => {
        // Lazy pluck
        for (const property in obj) {
            const value = obj[property]
            if (typeof (value) !== 'number') continue
            let memo
            if ((memo = this.memory[property])) {
                memo.count += 1
                memo.sum += value
                // memo.totalPow2 += Math.pow(value, 2)
                // memo.std = movingStd(memo.totalPow2, memo.sum, memo.count)
                memo.var = onlineVariance(value, memo.count, memo.var['avg'], memo.var['M2'])
                memo.std = Math.sqrt(memo.var.result)
                memo.avg = movingAvg(value, memo.avg, memo.count)
                if (value > memo.max) memo.max = value
                if (value < memo.min) memo.min = value
            }
            else if (typeof (value) === 'number')
                this.memory[property] = new lazyPluckObject()
        }
    }

    // Get any (with the limitation above) object statistics (like Python/Pandas DataFrame#summary method)
    this._getStats = (object, key = '__roo_t_', first = true, stream = false) => {
        if (isObject(object) && stream)
            this.lazyPluck(object)
        if (first && !isObject(object)) return { type: typeof (object) }
        else if (!isObject(object)) return { type: typeof (object) === 'number' ? (isFloat(object) ? 'float' : 'integer') : typeof (object) }
        const isArray = Array.isArray(object)
        if (first && isArray) return null
        let mixed = false
        if (isArray) {
            object = object.filter(el => el != null)
            mixed = new Set(object.map(o => typeof (o))).size == 2
        }
        let intersection
        // isNaN([1,2,5,"101k"]) == NaN && isNaN(NaN) == true // A fast correct way to check if an array is numbers 
        // either infered from string or plain numbers (mixed or not)
        if (isArray && !isNaN(Math.min.apply(null, object))) {
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
        } else if (isArray && object.length > 1 && !object.some(isObject)) {
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
            return this._getStats(newObject, '__roo_t_', true, true)
        }
    } else {
        this.getStats = (newObject) => {
            // console.log(`getting stats of obj:: ${JSON.stringify(newObject)}`)
            return this._getStats(newObject, '__roo_t_', true)
        }
    }
}


export default ObjectStatistics;