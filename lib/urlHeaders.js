import http from 'http';
import url from 'url'

export default function (Url, callback) {
    var options = {
        method: 'HEAD',
        host: url.parse(Url).host,
        port: 80,
        path: url.parse(Url).pathname
    };
    var req = http.request(options, function (r) {
        console.log
        callback({ status: r.statusCode, responseType: r.headers['content-type'] });
    });
    req.end();
}