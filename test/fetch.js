import ObjectStatistics from "../lib/ObjectStatistics.js"
import fetch from 'node-fetch';
import ndjson from 'ndjson'

const stats = new ObjectStatistics()
async function runtest(pathname) {
    console.log(`pathname=${pathname}`);
    let res = await fetch(pathname);
    if (!res.ok) throw new Error(`unexpected response ${res.statusText}`);
    res.body.pipe(ndjson.parse()).on('data', function (obj) {
        console.log(obj)
        let cc = stats.getStats(obj)
        console.log(cc)
    })
}

(async function () {
    runtest('https://dummyjson.com/products?limit=1000');
})();
