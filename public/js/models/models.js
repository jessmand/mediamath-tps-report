

window.Question = Backbone.Model.extend({
    urlRoot: "questions",
    idAttribute:"_id",
    defaults:{
        _id: null,
        type: "multipleChoice",
        questionText: ""
    }
});

window.QuestionCollection = Backbone.Collection.extend({
    model: Question,
    url: "questions"
});

window.Email = Backbone.Model.extend({
    urlRoot: "/emails",
    idAttribute:"_id",
    defaults: {
        _id: null,
        email: "",
        name: ""
    }
});

window.EmailCollection = Backbone.Collection.extend({
    model: Email,
    url: "emails"
});

window.Response = Backbone.Model.extend({

    urlRoot: "/responses",

    idAttribute: "_id",

    initialize: function() {
        this.timestamp = new Date();
    },

    defaults: {
        _id: null
    }
});

window.ResponseCollection = Backbone.Collection.extend({

    model: Response,

    url: "/responses"

});

window.Person = Backbone.Model.extend({

    urlRoot: "/people",

    idAttribute: "_id",

    defaults: {
        _id: null,
        name:"",
        image:"pictures/default.png"
    }
});

window.PersonCollection = Backbone.Collection.extend({
    url: "/people",
    model:Person
});

window.Superlative = Backbone.Model.extend({

    //name
    //responses

    urlRoot: "/superlatives",

    idAttribute: "_id",

    defaults: {
        _id: null,
        responses: [],
        used: false
    }
});

window.SuperlativeCollection = Backbone.Collection.extend({
    model: Superlative,
    url: "/superlatives",

    getUnusedSuperlatives: function() {
        var unusedSuperlatives = new SuperlativeCollection();
        this.each( function(superlative) {
            if (!superlative.get("used")) {
                unusedSuperlatives.add(superlative);
            }
        });
        return unusedSuperlatives;
    }
});

window.Sprint = Backbone.Model.extend({

    //sprintNumber

    urlRoot: "/sprints",

    idAttribute: "_id",

    performAnalysis: function() {
        var numResponses = this.get("responses").length;
        this.set({numberOfResponses:numResponses});
        var responseRate = Math.round(numResponses/this.get("numberOfPeople")*100)/100;
        this.set({responseRate:responseRate});
        var questionAnswers = {};
        this.get("responses").each(function(response) {
            var answers = response.get("answers");
            for (var i=0; i<answers.length; i++) {
                if (answers[i].question in questionAnswers) {
                    if (answers[i].questionType == "multipleChoice") {
                        questionAnswers[answers[i].question] += parseInt(answers[i].response)/numResponses;
                    } /*else if (answers[i].questionType == "freeResponse") {
                        questionAnswers[answers[i].question].push(answers[i].response);
                    }*/
                } else {
                    if (answers[i].questionType == "multipleChoice") {
                        questionAnswers[answers[i].question] = parseInt(answers[i].response)/numResponses;
                    } /*else if (answers[i].questionType == "freeResponse") {
                        questionAnswers[answers[i].question] = [answers[i].response];
                    }*/
                }
                questionAnswers[answers[i].question] = Math.round(questionAnswers[answers[i].question]*100)/100;
            }
        });
        this.set({questionAnswers:questionAnswers});
        return Backbone.sync("update", this);
    },

    pullSurveyQuestions: function() {
        var self = this;
        if (this.get("questions") === undefined) {
            var questionList = new QuestionCollection();
            return questionList.fetch().then(function() {
                var questions = [];
                questionList.each(function(question) {
                    questions.push(question.get("_id"));
                });
                self.set({"questions":questions});
            });
        } else {
            return $.Deferred;
        }
    },

    pullSuperlatives: function() {
        if (this.get("superlatives") === undefined) {
            var chosenSuperlativeOptions = new SuperlativeCollection();
            var superlativeOptions = new SuperlativeCollection();
            var self = this;
            var deferred = superlativeOptions.fetch().then(function () {
                var unusedSuperlativeOptions = superlativeOptions.getUnusedSuperlatives();
                    if (unusedSuperlativeOptions.length == 0) {
                        var superlative1 = new Superlative({name: "Most likely to be the candy man"});
                        superlativeOptions.add(superlative1);
                        return Backbone.sync("create", superlative1).then(function () {
                            var superlative2 = new Superlative({name: "Most violent"});
                            superlativeOptions.add(superlative2);
                            return Backbone.sync("create", superlative2).then(function () {
                                var superlative3 = new Superlative({name: "Best coder"});
                                superlativeOptions.add(superlative3);
                                return Backbone.sync("create", superlative3).then(function() {
                                    return superlativeOptions.fetch();
                                }, null);
                            }, null);
                        }, null);
                    } else {
                        return this;
                    }
                }, null);

            return deferred.then(function () {
                var deferredUpdate;
                var unusedSuperlativeOptions = superlativeOptions.getUnusedSuperlatives();
                for (var i = 0; i < 3; i++) {
                    if (unusedSuperlativeOptions.length == 0) {
                        console.log("Not enough superlatives in database to add 3");
                        break;
                    }
                    var superlative = unusedSuperlativeOptions.pop();
                    chosenSuperlativeOptions.add(superlative);
                     var updateSuperlative = function() {
                         superlative.set({used:true});
                         return Backbone.sync("update", superlative);
                     };
                    if (deferredUpdate === undefined) {
                        deferredUpdate = updateSuperlative();
                    } else {
                        deferredUpdate = deferredUpdate.then(updateSuperlative());
                    }

                }
                self.set({superlatives: chosenSuperlativeOptions});
                return deferredUpdate;

            }, null);
        } else {
            return $.Deferred();
        }

    },

    addResponse: function(response) {
        this.get("responses").add(response);
    },

    responsesToHistory: function() {
        var superlatives = this.get("superlatives");
        var people = new PersonCollection();
        var deferred = people.fetch().then(function() {
            var personDeferred;
            superlatives.each(function (superlative) {
                var votes = {};
                _.each(superlative.get("responses"), function (person) {
                    if (person in votes) {
                        votes[person] += 1
                    } else {
                        votes[person] = 1;
                    }
                });
                var winner;
                var maxVotes = 0;
                for (var key in votes) {
                    if (votes[key] > maxVotes) {
                        winner = key;
                        maxVotes = votes[key]
                    }
                }
                var person = people.find(function (model) {
                    return model.get('name') == winner;
                });
                var history = new History({person: person, superlative: superlative.get("name")});
                if (personDeferred === undefined) {
                    personDeferred = Backbone.sync("create", history);
                } else {
                    personDeferred.then(function () {
                        return Backbone.sync("create", history);
                    }, null);
                }

            });
            return personDeferred;
        }, null);
        return deferred;
    },

    deactivate: function() {
        this.set({active: false});
        var self = this;
        return this.performAnalysis().then(function() {
            return self.responsesToHistory();
        }, null);

    },

    activate: function() {
        this.set({active:true});
    },

    initialize: function() {
        var self = this;
        this.deferred = this.pullSuperlatives();
        this.deferred = this.deferred.then(function() {
            return self.pullSurveyQuestions();
        }, null);
        if (this.get("oldEndDate") !== undefined) {
            this.calculateBeginDate();
            this.calculateEndDate();
        }
    },

    calculateEndDate: function() {
        var date = new Date(this.get("oldEndDate").getTime());
        date.setDate(date.getDate()+14);
        this.set({endDate:date});
        this.unset("oldEndDate");
    },

    calculateBeginDate: function(oldBeginDate) {
        var date = new Date(this.get("oldBeginDate").getTime());
        date.setDate(date.getDate()+14);
        this.set({beginDate:date});
        this.unset("oldBeginDate");
    },

    parse: function(response) {
        if (response.superlatives !== undefined) {
            response.superlatives = new SuperlativeCollection(response.superlatives, {parse: true});
        }
        response.responses = new ResponseCollection(response.responses);

        return response;
    },

    defaults: {
        _id: null,
        active: false,
        responses: new ResponseCollection(),
        numberOfPeople: 15
    }
});

window.SprintCollection = Backbone.Collection.extend({

    model: Sprint,

    getCurrentSprint: function() {
        if (this.length>0) {
            var currentSprint = this.last();
        } else {
            return new Error("No surveys available");
        }
        if (currentSprint.get("active")) {
            return currentSprint;
        } else {
            //TODO: changed for testing purposes
            return currentSprint;
            //return new Error("Survey not currently open");
        }
    },

    getLastSprint: function() {
        if (this.length>0) {
            return this.last();
        }
    },

    getNextSprintNumber: function() {
        return this.last().get("sprintNumber") + 1;
    },

    url: "/sprints"

});


window.History = Backbone.Model.extend({
    //person
    //superlative
    urlRoot: "/history",

    idAttribute: "_id",

    defaults: {
        _id: null
    }
});

window.HistoryCollection = Backbone.Collection.extend({
    model: History,
    url: "/history"
});