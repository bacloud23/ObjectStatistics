# JSON-summary

**This is work in progress. It might crash and it has limitations**

Similar to Python **Pandas's** `DataFrame#summary()` .. This JavaScript function parses objects quickly and returns types and a basic set of statistics about inner arrays (`median, average, max, min, etc`)

Please note that **Pandas** summary function deals with a table, which is like a JSON with array's (rows) of same lengthes. There is no second and third level in dataframes, otherwise it is going to be a mess to define and get statistics. This is why **JSON-summary** does not and cannot go deeper.

**JSON-summary** turns this

```js
let oo = {
    v: [{
        a: 3,
        c: 10
    }, {
        a: 5,
        c: 100
    }],
    abee: [1, 5, 4, 8, 7, 9, 10, 1000],
    foo: 1,
    bar: 1.2,
    baz: "geez"
}
```

To

```js
{
   "v":{
      "array_a":{
         "type":"array",
         "min":3,
         "max":5,
         "avg":4,
         "q25":3.5,
         "q50":4,
         "q75":4.5,
         "median":4,
         "std":1.4142135623730951
      },
      "array_c":{
         "type":"array",
         "min":10,
         "max":100,
         "avg":55,
         "q25":32.5,
         "q50":55,
         "q75":77.5,
         "median":55,
         "std":63.63961030678928
      }
   },
   "abee":{
      "type":"array",
      "min":1,
      "max":1000,
      "avg":130.5,
      "q25":4.75,
      "q50":7.5,
      "q75":9.25,
      "median":7.5,
      "std":351.34313711811706
   },
   "foo":{
      "type":"integer"
   },
   "bar":{
      "type":"float"
   },
   "baz":{
      "type":"string"
   }
}
```

Note: It is meant to be lazy and opportunistic (to be fast). Like in one iteration try to grab anything useful then maybe go deeper. This is why code is not so clear.


