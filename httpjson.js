
var http = require('http');

exports.get = function get(domain, port, path, readData, onSuccess, onFail) {
    var req = http.request({
        'host' : domain,
        'port' : port,
        'path' : path,
        'headers' : {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(readData)
        }
    });
    req.on('response', function(response) {
        var body = '';
        response.on('data', function(chunk) {
            body += chunk;
        });
        response.on('end', function() {
            onSuccess(body);
        });
    });
    req.on('error', function(response) {
        onFail();
    });
    req.write(readData);
    req.end();
}

exports.post = function post(domain, port, path, writeData, onSuccess, onFail) {
    var req = http.request({
        'host' : domain,
        'port' : port,
        'path' : path,
        'method' : 'POST',
        'headers' : {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(writeData)
        }
    });
    req.on('response', function(response) {
        var body = '';
        response.on('data', function(chunk) {
            body += chunk;
        });
        response.on('end', function() {
            onSuccess(body);
        });
    });
    req.on('error', function(response){
        onFail();
    });
    req.write(writeData);
    req.end();
}
