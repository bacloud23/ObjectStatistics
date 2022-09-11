import ObjectStatistics from "./ObjectStatistics.js"
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
export default async function steamFetch(Url) {
    Url = decodeURIComponent(Url)
    console.log(`pathname=${Url}`);
    let res = await fetch(Url, {
        headers: {
            Authorization: 'Bearer ' + process.env.lichessToken,
            Accept: "application/x-ndjson"
        }
    });
    let co = 0
    if (!res.ok) throw new Error(`unexpected response ${res.statusText}`);
    return res.body./*pipe(throttle).*/pipe(ndjson.parse())
    // .on('data', async function (obj) {
    //     let cc = stats.getStats(obj)
    //     // console.log('Object stats::')
    //     // console.log(cc)
    //     if (co++ > 5)
    //         return stats.memory
    // }).on('end', () => {
    //     return stats.memory
    // })
}
