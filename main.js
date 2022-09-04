
// Example
let oo = {
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
console.log(oo)
let cc = getObjectStatistics(oo)
console.log(cc)
