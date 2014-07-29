var mongo = require('mongodb');

var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('surveydb', server, {safe: true});
//db = new Mongo().getDB("myDatabase");

db.open(function(err, db) {
    if (err) {
        console.log(err);
    }
});

exports.getQuestions = function(req, res) {
    console.log(req);
    db.collection('questions', function(err, collection) {
        collection.find().toArray(function(err, items) {
            console.log(items);
            res.send(items);
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


exports.getSuperlatives = function(req, res) {
    db.collection('superlatives', function(err, collection) {
        collection.find().toArray(function(err, items) {
            res.send(items);
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

exports.addSuperlative = function(req, res) {
    var superlative = req.body;
    console.log('Adding superlative: ' + JSON.stringify(superlative));
    db.collection('superlatives', function(err, collection) {
        collection.insert(superlative, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    });
};

exports.deleteSuperlative = function(req, res) {
    var id = req.params.id;
    console.log('Deleting superlative: ' + id);
    db.collection('superlatives', function(err, collection) {
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
/*--------------------------------------------------------------------------------------------------------------------*/
// Populate database with sample data -- Only used once: the first time the application is started.
// You'd typically not find this code in a real-life app, since the database would already exist.
/*var populateEmails = function() {

    var emails = [
        {
            name: "Jessica Andersen",
            email: "jandersen@mediamath.com"
        },
        {
            name: "David Ashpole",
            email: "dashpole@mediamath.com"
        }
    ];

    db.collection('emails', function(err, collection) {
        collection.insert(emails, {safe:true}, function(err, result) {});
    });

};

var populateQuestions = function() {

    var questions = [
        {
            type:"multipleChoice",
            questionText:"How happy are you with your role?",
            choices:["1", "2", "3", "4", "5"]
        },
        {
            type:"freeResponse",
            questionText:"What could we do to make you happier?"
        }
    ];

    db.collection('questions', function(err, collection) {
        collection.insert(questions, {safe:true}, function(err, result) {});
    });

};*/