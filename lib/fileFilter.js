import { Transform, PassThrough } from 'stream'

class hasLines extends PassThrough {
    constructor(opts) {
        super({...opts, autoDestroy: true})
        this.hasLines = false
    }

    _transform(data,enc,callback) {
        if (data.indexOf('\n') >= 0) {
            this.hasLines = true
            // this.emit('finish');
            this.emit('error', new Error('Oh no!'));
        }
        this.push(data)
        callback()
    }
}

class FilterHasLines extends Transform {

    constructor() {
        super({
            readableObjectMode: true,
            writableObjectMode: true
        })
    }

    _transform(chunk, encoding, next) {
        if (this.hasNewline(chunk)) {
            return next(null, chunk)
        }

        next()
    }

    hasNewline(value) {
        return value.indexOf('\n')
    }
}

export default hasLines