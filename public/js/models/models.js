

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
        name:""
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

    parse: function(response) {
        console.log("parsing superlative");
        response.responses = new PersonCollection(response.responses);
        return response;
    },

    defaults: {
        _id: null,
        responses: new PersonCollection()
    }
});

window.SuperlativeCollection = Backbone.Collection.extend({
    model: Superlative,
    url: "/superlatives"
});

window.Sprint = Backbone.Model.extend({

    //sprintNumber

    urlRoot: "/sprints",

    idAttribute: "_id",

    performAnalysis: function() {
        var responseRate, averageRole, averageTeam, averageCompany, averageProduct;
    },

    pullSuperlatives: function() {
        if (this.get("superlatives") === undefined) {
            var chosenSuperlativeOptions = new SuperlativeCollection();
            var superlativeOptions = new SuperlativeCollection();
            var self = this;
            var deferred = superlativeOptions.fetch().then(function () {
                    if (superlativeOptions.length == 0) {
                        var superlative1 = new Superlative({name: "Most likely to be the candy man"});
                        return Backbone.sync("create", superlative1).then(function () {
                            var superlative2 = new Superlative({name: "Most violent"});
                            return Backbone.sync("create", superlative2).then(function () {
                                var superlative3 = new Superlative({name: "Best coder"});
                                return Backbone.sync("create", superlative3).then(function () {
                                        return superlativeOptions.fetch();
                                    }, null);
                            }, null);
                        }, null);
                    } else {
                        return this;
                    }
                }, null);

            return deferred.then(function () {
                for (var i = superlativeOptions.length - 1; i > superlativeOptions.length - 4; i--) {
                    if (i < 0) {
                        console.log("Not enough superlatives in database to add 3");
                        break;
                    }
                    var superlative = superlativeOptions.at(i);
                    chosenSuperlativeOptions.add(superlative);
                     superlative.destroy({success: function() {
                     console.log("Superlative successfully deleted");
                     }});
                }
                self.set({superlatives: chosenSuperlativeOptions});
                return this;

            }, null);
        } else {
            return $.Deferred();
        }

    },

    addResponse: function(response) {
        this.get("responses").add(response);
    },

    deactivate: function() {
        this.set({active: false});
        this.performAnalysis();
    },

    activate: function() {
        this.set({active:true});
    },

    constructor: function(arguments) {
        this.deferred = this.pullSuperlatives();
        this.set({endDate: this.calculateEndDate(arguments[0].oldEndDate)});
        delete arguments[0].oldEndDate;
        this.set({beginDate: this.calculateBeginDate(arguments[0].oldBeginDate)});
        delete arguments[0].oldBeginDate;
        Backbone.Model.apply(this, arguments);
    },

    calculateEndDate: function(oldEndDate) {
        var date = new Date(oldEndDate.getTime());
        date.setDate(date.getDate()+14);
        return date;
    },

    calculateBeginDate: function(oldBeginDate) {
        var date = new Date(oldBeginDate.getTime());
        date.setDate(date.getDate()+14);
        return date;
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
        responses: new ResponseCollection()
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
            return new Error("Survey not currently open");
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