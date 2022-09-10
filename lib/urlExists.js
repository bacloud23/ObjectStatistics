import http from 'http';
import url from 'url'

export default function (Url, callback) {
    Url = decodeURIComponent(Url)
    var options = {
        method: 'HEAD',
        host: url.parse(Url).host,
        port: 80,
        path: url.parse(Url).pathname
    };
    var req = http.request(options, function (r) {
        callback(r.statusCode == 200);
    });
    req.end();
}