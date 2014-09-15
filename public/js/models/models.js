

window.Question = Backbone.Model.extend({
    urlRoot: "questions",
    idAttribute:"_id",
    defaults:{
        _id: null,
        active: true,
        used: false
    }
});

window.QuestionCollection = Backbone.Collection.extend({
    model: Question,
    url: "questions"
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

window.Sprint = Backbone.Model.extend({

    urlRoot: "/sprints",

    idAttribute: "_id",

    //when a sprint is deactivated, aggregate results from the responses
    performAnalysis: function() {
        var numResponses = this.get("responses").length;
        this.set({numberOfResponses:numResponses});
        var self = this;
        return this.setPossiblePeople().then(function() {
            //compare the number of responses received with
            //the number of possible people who could have responded
            var responseRate = Math.round(numResponses / self.get("numberOfPeople") * 100) / 100;
            self.set({responseRate: responseRate});
            //average out all numerical multiple choice questions
            var questionAnswers = {};
            self.get("responses").each(function (response) {
                var answers = response.get("answers");
                for (var i = 0; i < answers.length; i++) {
                    if (answers[i].questionType == "multipleChoice" && answers[i].isNumerical == true) {
                        if (answers[i].question in questionAnswers) {
                            questionAnswers[answers[i].question] += parseInt(answers[i].response) / numResponses;
                        } else {
                            questionAnswers[answers[i].question] = parseInt(answers[i].response) / numResponses;
                        }
                    }
                    questionAnswers[answers[i].question] = Math.round(questionAnswers[answers[i].question] * 100) / 100;
                }
            });
            self.set({questionAnswers: questionAnswers});
            return Backbone.sync("update", self);
        }, null);
    },

    //get the current length of the list of people
    setPossiblePeople: function() {
        var people = new PersonCollection();
        var self = this;
        return people.fetch().then(function() {
            self.set({numberOfPeople:people.where({responseRequired: true}).length});
        }, null);
    },

    //when creating a sprint, save the ids of the active questions in the database
    //necessary so that things don't break if a new question is created in the middle of a sprint
    pullSurveyQuestions: function() {
        var self = this;
        if (this.get("questions") === undefined) {
            var questionList = new QuestionCollection();
            return questionList.fetch().then(function() {
                var questions = [];
                questionList.each(function(question) {
                    if (question.get("active") == true) {
                        questions.push(question.get("_id"));
                        question.set({used:true});
                        Backbone.sync("update", question);
                    }
                });
                self.set({"questions":questions});
            }, null);
        } else {
            return $.Deferred;
        }
    },

    //called when someone submits a survey
    addResponse: function(response) {
        this.get("responses").add(response);
    },

    //at the end of a sprint, calculate winners of the sprint's superlative
    responsesToHistory: function() {
        var superlatives = this.get("superlatives");
        var people = new PersonCollection();
        var deferred = people.fetch().then(function() {
            var personDeferred;
            _.each(superlatives, function (superlative) {
                //aggregate votes for each person
                var votes = {};
                _.each(superlative["responses"], function (person) {
                    if (person in votes) {
                        votes[person] += 1
                    } else {
                        votes[person] = 1;
                    }
                });
                //the winner is the person with the most votes
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
                //create the history object and save it
                var history = new History({person: person, superlative: superlative["name"]});
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

    //ends a sprint
    deactivate: function() {
        this.set({completed: true});
        var self = this;
        return this.performAnalysis().then(function() {
            return self.responsesToHistory();
        }, null);

    },

    initialize: function() {
        var self = this;
        this.deferred = this.pullSurveyQuestions();
    },

    parse: function(response) {
        response.responses = new ResponseCollection(response.responses);
        return response;
    },

    defaults: {
        _id: null,
        responses: new ResponseCollection(),
        open:false,
        completed: false
    }
});

window.SprintCollection = Backbone.Collection.extend({

    model: Sprint,

    //when people go to the survey, display is based on if a sprint is open
    getOpenSprint: function() {
        if (this.length>0) {
            var currentSprint = this.last();
        } else {
            return new Error("Tell Rob to go start a sprint");
        }
        if (currentSprint.get("completed")) {
            return new Error("Tell Rob to go start a sprint")
        } else if (!currentSprint.get("open")) {
            return new Error("The survey's not open, but Eddie's office is");
        } else {
            return currentSprint;
        }
    },

    getFirstUncompletedSprint: function() {
        var filtered = this.where({completed:false});
        return filtered[0];
    },

    getCompletedSprints: function() {
        return this.where({"completed": true});
    },

    getNextSprintNumber: function() {
        if (this.length>0) {
            return this.last().get("sprintNumber") + 1;
        } else {
            return 1;
        }
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