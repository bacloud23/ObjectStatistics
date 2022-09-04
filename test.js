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

// Get any (with the limitation above) object statistics (like Python/Pandas DataFrame#summary method)
function getObjectStatistics(object, key = '__roo_t_', first = true) {
    if (first && isNotObject(object)) return null
    else if (isNotObject(object)) return { type: typeof (object) === 'number' ? (isFloat(object) ? 'float' : 'integer') : typeof (object) }
    if (first && Array.isArray(object)) return null
    
    if(Array.isArray(object))
        object = object.filter(el => el != null)
    let min, intersection
    if (Array.isArray(object) && !isNaN(min = Math.min.apply(null, object))) {
        const ret = {
            type: 'array:number',
            count: object.length,
            mean: object.reduce((a, b) => a + b, 0) / object.length,
            std: std(object),
            min: min,
            q25: q25(object),
            median: q50(object),
            q75: q75(object),
            max: Math.max.apply(null, object),
        }
        return ret
    } else if (Array.isArray(object) && object.length > 1 && object.every(isNotObject)) {
        const ret = {
            type: 'array:mixed',
            count: object.length,
            unique: new Set(object).size
        }
        return ret
    } else if (Array.isArray(object) && object.length > 1 && (intersection = intersect(Object.keys(object[0]), Object.keys(object[1]))).length) {
        const ret = {}
        for (let index = 0; index < intersection.length; index++) {
            const key = intersection[index]
            const arr = pluck(object, key)
            ret[`${key}`] = getObjectStatistics(arr, key, false)
        }
        return ret
    }
    const finalResult = {}
    for (const property in object) {
        const value = object[property]
        finalResult[`${property}`] = getObjectStatistics(value, property, false)
    }
    return finalResult
}

// Example
oo = {
    v: [{
        a: 3,
        c: 10
    }, {
        a: 5,
        c: 100
    }],
    abee: [1, 5, 4, 8, 7, 9, 10, 1000],
    wee: ["1", "5", "5", true, Math.max, Math.max, undefined, null],
    foo: 1,
    bar: 1.2,
    baz: "geez"
}

cc = getObjectStatistics(oo)
