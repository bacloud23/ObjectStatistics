# `ObjectStatistics`

**This is work in progress. It might crash and it has limitations. An npm package will be shiped and an API will be provided**

Similar to Python `Pandas's` `DataFrame#summary()` .. This JavaScript function parses objects quickly and returns types and a basic set of statistics about inner arrays (`median, average, max, min, etc`), as well as a view of data (data types and structure).

It does support a *streaming* version as well. For instance a stream of JSON (called [NDJson](http://ndjson.org/)) can be fed to `ObjectStatistics`; In this case, (`median, average, max, min, etc`) are calculated accordingly with the latest seen data in a rolling fashion.

Please note that `Pandas` summary function deals with a table, which is like a JSON with array's (rows) of same lengthes. There is no second and third level in dataframes, otherwise it is going to be a mess to define and get statistics. This is why `ObjectStatistics` does not and cannot go deeper.

`ObjectStatistics` turns this

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
    wee: ["1", "5", "5", true, Math.max, Math.max, undefined, null],
    foo: 1,
    bar: 1.2,
    baz: "geez"
}
```

To

```js
{
   "v":{
      "a":{
         "type":"array:number",
         "count":2,
         "mean":4,
         "std":1.4142135623730951,
         "min":3,
         "q25":3.5,
         "median":4,
         "q75":4.5,
         "max":5
      },
      "c":{
         "type":"array:number",
         "count":2,
         "mean":55,
         "std":63.63961030678928,
         "min":10,
         "q25":32.5,
         "median":55,
         "q75":77.5,
         "max":100
      }
   },
   "abee":{
      "type":"array:number",
      "count":8,
      "mean":130.5,
      "std":351.34313711811706,
      "min":1,
      "q25":4.75,
      "median":7.5,
      "q75":9.25,
      "max":1000
   },
   "wee":{
      "type":"array:mixed",
      "count":6,
      "unique":4
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

Note: It is meant to be eager and opportunistic (to be fast). Like in one iteration try to grab anything useful then maybe go deeper. This is why code is not so clear.
Note: `undefined` are considered unique values, while `null` are omited from any count.


