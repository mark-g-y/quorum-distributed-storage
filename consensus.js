
var fs = require('fs');
var querystring = require('querystring');
var httpjson = require('./httpjson');

var config = JSON.parse(fs.readFileSync('config', 'utf8'));

var numNodes = config['num_nodes'];
var replicas = config['replicas'];
var readQuorum = config['read_quorum'];
var writeQuorum = config['write_quorum'];

exports.read = function read(sreq, res, next) {
	var responses = [];
	var numReadSucceed = 0;
	var numReadFail = 0;
	var readData = JSON.stringify({
		'key' : sreq.query.key
	});
	function readFromNode(domain, port, readData) {
		httpjson.get(domain, port, '/read_vote', readData, function(response) {
			responses.push(JSON.parse(response)['value']);
			numReadSucceed++;
			if (responses.length == readQuorum) {
				var mostRecent = null;
				responses.forEach(function(r) {
					if (r != null && (mostRecent == null || r['timestamp'] < mostRecent['timestamp'])) {
						mostRecent = r;
					}
				});
				res.status(200).send({'result' : mostRecent});
			}
		}, function() {
			numReadFail++;
			if (numReadFail > numNodes - readQuorum) {
				res.status(200).send({'result' : 'error'});
			} else {
				var replica = replicas[readQuorum - 1 + numReadFail];
				readFromNode(replica['domain'], replica['port'], readData);
			}
		});
	}
	for (var i = 0; i < readQuorum; i++) {
		var replica = replicas[i];
		readFromNode(replica['domain'], replica['port'], readData);
	}
}

exports.write = function write(sreq, res, next) {
	responses = [];
	var numWriteSucceed = 0;
	var numWriteFail = 0;
	var writeData = JSON.stringify({
		'key' : sreq.query.key, 
		'value' : sreq.query.value,
		'timestamp' : new Date().getTime()
	});
	function writeToNode(domain, port, writeData) {
		httpjson.post(domain, port, '/write_vote', writeData, function(response) {
			body = JSON.parse(response);
			numWriteSucceed++;
			responses.push(response);
			if (numWriteSucceed == writeQuorum) {
				res.send({'status' : 'success'});
			}
		}, function() {
			numWriteFail++;
			if (numWriteFail > numNodes - writeQuorum) {
				res.send({'status' : 'fail'});
			} else {
				var replica = replicas[writeQuorum - 1 + numWriteFail];
				writeToNode(replica['domain'], replica['port'], writeData);
			}
		});
	}
	for (var i = 0; i < writeQuorum; i++) {
		var replica = replicas[i];
		writeToNode(replica['domain'], replica['port'], writeData);
	}
};