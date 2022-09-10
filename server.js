// Require the framework and instantiate it

import fastify from 'fastify'
import fastifyWebsocket from '@fastify/websocket'
import fastifyServe from '@fastify/static'
import path from 'path'
import { fileURLToPath } from 'url'
import fastifyRateLimit from '@fastify/rate-limit'
import ObjectStatistics from './lib/ObjectStatistics.js'
import fetch from 'node-fetch';
import ndjson from 'ndjson'
import { config as dotenv } from 'dotenv'
import syncRouter from './routes/sync.js'
dotenv()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = fastify({ logger: true })

app.register(fastifyWebsocket)
app.register(fastifyRateLimit, {
    "max": 100,
    "timeWindow": "1 minute"
})
app.register(syncRouter, { prefix: 'sync' })
app.register(fastifyServe, { root: path.join(__dirname, 'public') })


// Declare a route
app.get('/api/', async (request, reply) => {
    const stats = new ObjectStatistics(true)
    async function runtest(pathname) {
        console.log(`pathname=${pathname}`);
        let res = await fetch(pathname, {
            headers: {
                Authorization: 'Bearer ' + process.env.lichessToken,
                Accept: "application/x-ndjson"
            }
        });
        let co = 0
        if (!res.ok) throw new Error(`unexpected response ${res.statusText}`);
        res.body./*pipe(throttle).*/pipe(ndjson.parse()).on('data', async function (obj) {
            console.log(typeof (obj))
            obj.d ? console.log(obj.d.players) : null
            let cc = stats.getStats(obj)
            // console.log('Object stats::')
            // console.log(cc)
            if (co++ > 5) {
                console.log(stats.memory)
                res.body.unpipe()
            }
        }).on('end', () => {
            console.log(stats.memory)
        })

    }
    runtest('https://lichess.org/api/tv/feed')
    return { hello: 'world' }
})

// Run the server!
const start = async () => {
    try {
        await app.listen({ port: 3000 })
    } catch (err) {
        app.log.error(err)
        process.exit(1)
    }
}
start()