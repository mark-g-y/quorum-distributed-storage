
var bodyParser = require('body-parser');
var express = require('express');
var consensus = require('./consensus');
var storage = require('./storage');

var server = express();
server.use(bodyParser.json());

var args = process.argv.slice(2);
var port = args[0];

server.get('/read', consensus.read);
server.get('/write', consensus.write);

server.get('/read_vote', storage.read);
server.post('/write_vote', storage.write);

server.listen(port);