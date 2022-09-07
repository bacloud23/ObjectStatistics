import ObjectStatistics from "../lib/ObjectStatistics.js"
import fetch from 'node-fetch';
import ndjson from 'ndjson'
import { config as dotenv } from 'dotenv'
dotenv()

const stats = new ObjectStatistics()
async function runtest(pathname) {
    console.log(`pathname=${pathname}`);
    let res = await fetch(pathname, {
        headers: {
            Authorization: 'Bearer ' + process.env.lichessToken,
            Accept: "application/x-ndjson"
        }
    });
    if (!res.ok) throw new Error(`unexpected response ${res.statusText}`);
    res.body.pipe(ndjson.parse()).on('data', function (obj) {
        // console.log(obj)
        let cc = stats.getStats(obj)
        console.log(cc)
    })
}

(async function () {
    runtest('https://lichess.org/api/tv/feed');
})();
