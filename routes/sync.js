import { v4 as uuidv4 } from 'uuid'
import ObjectStatistics from '../lib/ObjectStatistics'

async function routes(fastify, options) {
    // Channels is a map of { key: socket }
    // Where the key is referred as: channel
    const channels = new Map()

    fastify.addHook('preValidation', async (request, reply) => {
        // check if the request is authenticated
        const isAuthenticated = true//fastify.wsauth(request)
        if (!isAuthenticated) {
            await reply.code(401).send('not authenticated')
        }
    })
    // Periodically clean dead sockets
    setInterval(function ping() {
        fastify.websocketServer.clients.forEach(function each(ws) {
            console.log('cleaning dead sockets')
            if (ws.isAlive === false) return ws.terminate()
            ws.isAlive = false
            ws.ping()
        })
    }, 100000)

    setInterval(() => {
        console.log(`seeing all clients`)
        for (let client of fastify.websocketServer.clients) {
            if (client.readyState === 1) console.log(client.id)
        }
    }, 2000);

    // Periodically refresh sockets
    setInterval(function () {
        console.log('refreshing channels')
        refreshChannels(channels)
    }, 100000)


    fastify.get('/ws/*', { websocket: true }, (connection, request) => {
        connection.socket.id = uuidv4()
        const socket = connection.socket
        // Client connect. Channel identified while channel is a URL
        const channel = request.query.channel
        console.log(`Channel identified ${channel}`)
        if (validChannel(channel)) {
            addChannel(channel, socket)
            socket.isAlive = true
            socket.on('pong', heartbeat)
        } else {
            console.log('something fishy kick him out')
            // return for current connection !
            socket.isAlive = false
            connection.destroy()
            return
        }
        // New channel
        broadcast({ sender: '__server', message: `${channel} joined` }, channel)
        // Leaving channel
        socket.on('close', () => {
            socket.isAlive = false
            connection.destroy()
            // broadcast({ sender: '__server', message: `${channel} left` }, channel)
        })
        // Broadcast incoming message
        socket.on('message', (message) => {
            message = JSON.parse(message.toString())
            broadcast({ sender: channel, ...message }, channel)
        })


        ObjectStatistics(true)
    })

    function heartbeat() {
        this.isAlive = true
    }

    function validChannel(url) {
        url = decodeURIComponent(url)
        return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(url);
    }

    function refreshChannels(channels) {
        Object.keys(channels).forEach((channel) => {
            const sockets = channels.get(channel)
            sockets.slice(0).forEach((socket) => {
                if (!socket.isAlive) sockets.splice(sockets.indexOf(socket), 1)
            })
        })
    }

    function addChannel(channel, socket) {
        if (!channels.get(channel)) channels.set(channel, [socket])
        else channels.get(channel).push(socket)
        socket.channel = channel
    }
    function broadcast(message, channel) {
        // Clients are the same sockets around
        for (let client of fastify.websocketServer.clients) {
            if (client.readyState === 1 && client.channel === channel) client.send(JSON.stringify(message))
        }
    }
}

export default routes