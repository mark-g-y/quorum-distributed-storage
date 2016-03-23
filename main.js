
var bodyParser = require('body-parser');
var express = require('express');
var consensus = require('./consensus');
var storage = require('./storage');

var server = express();
server.use(bodyParser.json());

var args = process.argv.slice(2);

if (args.length != 2 && args.length != 4) {
    console.log('Error: please use either of the following commands:');
    console.log('    If storing data in memory, specify <current_node_id> <port> as command line arguments');
    console.log('    If storing data in MongoDB, specify <current_node_id> <port> <mongoHost> <mongoPort> as command line arguments');
    process.exit(1);
}

var port = args[1];

server.get('/read', consensus.read);
server.get('/write', consensus.write);

server.get('/read_vote', storage.read);
server.post('/write_vote', storage.write);

server.listen(port);