import ObjectStatistics from "../lib/ObjectStatistics.js"
import fetch from 'node-fetch';
import ndjson from 'ndjson'
// import {createBandwidthThrottleGroup} from 'bandwidth-throttle-stream';

import { config as dotenv } from 'dotenv'
dotenv()
// const bandwidthThrottleGroup = createBandwidthThrottleGroup({
//     bytesPerSecond: 100 // 5KB/s
// });
// const throttle = bandwidthThrottleGroup.createBandwidthThrottle(100);

const stats = new ObjectStatistics(true)
async function runtest(pathname) {
    console.log(`pathname=${pathname}`);
    let res = await fetch(pathname, {
        headers: {
            Authorization: 'Bearer ' + process.env.lichessToken,
            Accept: "application/x-ndjson"
        }
    });
    if (!res.ok) throw new Error(`unexpected response ${res.statusText}`);
    res.body./*pipe(throttle).*/pipe(ndjson.parse()).on('data', async function (obj) {
        console.log(obj)
        let cc = stats.getStats(obj)
        console.log('Object stats::')
        console.log(cc)

    })
}

(async function () {
    runtest('https://lichess.org/api/tv/feed');
})();
