
var bodyParser = require('body-parser');
var express = require('express');
var consensus = require('./consensus');
var storage = require('./storage');

var server = express();
server.use(bodyParser.json());

var args = process.argv.slice(2);

if (args.length != 2) {
	console.log('Error: please specify <current_node_id> <port> as command line arguments');
	process.exit(1);
}

var port = args[1];

server.get('/read', consensus.read);
server.post('/write', consensus.write);

server.get('/read_vote', storage.read);
server.post('/write_vote', storage.write);

server.listen(port);