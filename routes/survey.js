var mongo = require('mongodb');

var Server = mongo.Server,
    Db = mongo.Db,
    MongoClient = mongo.MongoClient,
    BSON = mongo.BSONPure;

var MONGODB_URI = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || "mongodb://localhost"; // Make sure to replace that URI with the one provided by MongoLab
var db;

MongoClient.connect(MONGODB_URI, function(err, database) {
    if (err) {
        throw err;
    }
    db = database;
});

//var server = new Server('dbh44', 27447, {auto_reconnect: true});
//db = new Db('surveydb', server, {safe: true});
//db = new Mongo().getDB("myDatabase");

exports.getQuestions = function(req, res) {
    db.collection('questions', function(err, collection) {
        collection.find().toArray(function(err, items) {
            console.log(items);
            res.send(items);
        });
    });
};

exports.addQuestion = function(req, res) {
    var question = req.body;
    console.log('Adding question: ' + JSON.stringify(question));
    db.collection('questions', function(err, collection) {
        collection.insert(question, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    });
};

exports.deleteQuestion = function(req, res) {
    var id = req.params.id;
    console.log('Deleting question: ' + id);
    db.collection('questions', function(err, collection) {
        collection.remove({'_id':new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred - ' + err});
            } else {
                console.log('' + result + ' document(s) deleted');
                res.send(req.body);
            }
        });
    });
};

exports.updateQuestion = function(req, res) {
    var id = req.params.id;
    var question = req.body;
    delete question._id;
    console.log('Updating question: ' + id);
    console.log(JSON.stringify(question));
    db.collection('questions', function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, question, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating question: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(question);
            }
        });
    });
};

exports.getSuperlativeHistory = function(req, res) {
    db.collection('history', function(err, collection) {
        collection.find().toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.addSuperlativeHistory = function(req, res) {
    var history = req.body;
    console.log('Adding history: ' + JSON.stringify(history));
    db.collection('history', function(err, collection) {
        collection.insert(history, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    });
};

exports.getResponses = function(req, res) {
    db.collection('responses', function(err, collection) {
        collection.find().toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.addResponse = function(req, res) {
    var response = req.body;
    console.log('Adding response: ' + JSON.stringify(response));
    db.collection('responses', function(err, collection) {
        collection.insert(response, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    });
};

exports.getPeople = function(req, res) {
    db.collection('people', function(err, collection) {
        collection.find().toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.getSprint = function(req, res) {
    var id = req.params.id;
    console.log('Retrieving sprint: ' + id);
    db.collection('sprints', function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            res.send(item);
        });
    });
};

exports.getSprints = function(req, res) {
    db.collection('sprints', function(err, collection) {
        collection.find().toArray(function(err, items) {
            console.log('Success: ' + JSON.stringify(items));
            res.send(items);
        });
    });
};



exports.addSprint = function(req, res) {
    var sprint = req.body;
    console.log('Adding sprint: ' + JSON.stringify(sprint));
    db.collection('sprints', function(err, collection) {
        collection.insert(sprint, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    });
};

exports.updateSprint = function(req, res) {
    var id = req.params.id;
    var sprint = req.body;
    delete sprint._id;
    console.log('Updating sprint: ' + id);
    console.log(JSON.stringify(sprint));
    db.collection('sprints', function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, sprint, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating sprint: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(sprint);
            }
        });
    });
};

exports.deleteSprint = function(req, res) {
    var id = req.params.id;
    console.log('Deleting sprint: ' + id);
    db.collection('sprints', function(err, collection) {
        collection.remove({'_id':new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred - ' + err});
            } else {
                console.log('' + result + ' document(s) deleted');
                res.send(req.body);
            }
        });
    });
};

exports.addPerson = function(req, res) {
    var person = req.body;
    console.log('Adding person: ' + JSON.stringify(person));
    db.collection('people', function(err, collection) {
        collection.insert(person, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    });
};

exports.deletePerson = function(req, res) {
    var id = req.params.id;
    console.log('Deleting person: ' + id);
    db.collection('people', function(err, collection) {
        collection.remove({'_id':new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred - ' + err});
            } else {
                console.log('' + result + ' document(s) deleted');
                res.send(req.body);
            }
        });
    });
};
