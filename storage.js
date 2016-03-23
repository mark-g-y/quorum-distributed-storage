
var mongo = require('mongodb').MongoClient

var args = process.argv.slice(2);
var storage;
var storageMethod;

if (args.length == 4) {
    var mongoHost = args[2];
    var mongoPort = args[3];
    var url = 'mongodb://' + mongoHost + ':' + mongoPort + '/quorumreplicastorage';
    storageMethod = 'mongodb';

    mongo.connect(url, function(err, db) {
        if (err != null) {
            console.log('Error connecting to MongoDB');
            process.exit(1);
        }
        storage = db.collection('keyvalues');
    });
} else {
    storageMethod = 'memory';
    storage = {};
}

function readValue(body, onValueRead) {
    if (storageMethod == 'mongodb') {
        storage.findOne({'key' : body['key']}, function(err, result) {
            onValueRead(result['value']);
        });
    } else if (storageMethod == 'memory') {
        var value = body['key'] in storage ? storage[body['key']]['value'] : null;
        onValueRead(value);
    }
}

function writeValue(storageValue, onValueWrite, onValueWriteFail) {
    var key = storageValue['key'];
    var value = storageValue['value'];
    var timestamp = storageValue['timestamp'];
    if (storageMethod == 'mongodb') {
        storage.update({'_id' : key, 'timestamp' : {$lt : timestamp}}, 
            {$set : storageValue}, {upsert : true}, 
            function(err, result) {
                if (err == null) {
                    onValueWrite();
                } else {
                    onValueWriteFail();
                }
        });
    } else if (storageMethod == 'memory') {
        if (!(key in storage) || key in storage && storage[key]['timestamp'] < timestamp) {
            storage[key] = {
                'value' : value,
                'timestamp' : timestamp
            };
        }
        onValueWrite();
    }
}

exports.read = function read(req, res, next) {
    var body = req.body;
    readValue(body, function(value) {
        res.status(200).send({'value' : value});
    });
};

exports.write = function write(req, res, next) {
    var body = req.body;
    var key = body['key'];
    var value = body['value'];
    var timestamp = body['timestamp'];
    var storageValue = {
        'key' : key,
        'value' : value,
        'timestamp' : timestamp
    };
    writeValue(storageValue, function() {
        res.status(200).send({status : 'success'});
    }, function() {
        res.status(200).send({status : 'fail'});
    });
};
