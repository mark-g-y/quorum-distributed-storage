
// in-memory storage, can switch to MongoDB in future
var storage = {};

exports.read = function read(req, res, next) {
	var body = req.body;
	var value = body['key'] in storage ? storage[body['key']] : null;
	res.status(200).send({'value' : value});
};

exports.write = function write(req, res, next) {
	var body = req.body;
	var key = body['key'];
	var value = body['value'];
	var timestamp = body['timestamp'];
	if (!(key in body) || key in body && body['key']['timestamp'] < timestamp) {
		storage[key] = {
			'value' : value,
			'timestamp' : timestamp
		}
		res.status(200).send({status : 'success'});
	}
};
