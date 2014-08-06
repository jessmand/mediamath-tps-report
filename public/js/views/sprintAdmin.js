window.SprintAdminView = Backbone.View.extend({

    initialize:function (options) {
        this.adminView = options.adminView;
        var self = this;
        this.sprints = new SprintCollection();
        this.sprints.fetch().then(function() {
            self.render();
        }, null);
    },

    render:function () {
        $(this.el).html(this.template({sprints:this.sprints}));
        var today = new Date();
        today.setHours(0,0,0,0);
        if (this.sprints.length>0) {
            var lastEndDate = new Date(this.sprints.last().get("endDate"));
            lastEndDate.setDate(lastEndDate.getDate()+1);
        } else {
            var lastEndDate = null;
        }
        $( "#start-date" ).datepicker({
            defaultDate: lastEndDate,
            numberOfMonths: 2,
            minDate: lastEndDate,
            onClose: function( selectedDate ) {
                $( "#end-date" ).datepicker( "option", "minDate", new Date(Math.max.apply(null,[new Date(selectedDate),today])) );
            }
        });
        $( "#end-date" ).datepicker({
            numberOfMonths: 2,
            onClose: function( selectedDate ) {
                $( "#start-date" ).datepicker( "option", "maxDate", selectedDate );
            }
        });
        return this;
    },

    events: {
        "click #add-new-superlative": "addSuperlative",
        "click #delete-sprint-superlative": "deleteSuperlative",
        "click #add-sprint-button": "addSprint",
        "click .delete-sprint-button": "deleteSprint",
        "click .open-survey-button": "openSurvey",
        "click .close-survey-button": "closeSurvey",
        "click .end-sprint-button": "endSprint"
    },

    addSuperlative: function(e) {
        e.preventDefault();
        var superlativeNumber = $(".superlative-line").length+1;
        var newSuperlative = $('<div class="col-sm-10"><input class="form-control new-sprint-superlative" id="new-sprint-superlative-'+superlativeNumber+'" placeholder="Superlative '+superlativeNumber+'"></div>');
        if ($("#delete-sprint-superlative").length == 0) {
            var deleteSuperlativeButton = $('<span class="glyphicon glyphicon-remove" id="delete-sprint-superlative"></span>');
        } else {
            var deleteSuperlativeButton = $("#delete-sprint-superlative");
            deleteSuperlativeButton.detach();
        }
        newSuperlative = newSuperlative.add(deleteSuperlativeButton);
        newSuperlative = newSuperlative.wrapAll('<div class="row superlative-line"></div>').parent();
        newSuperlative.insertAfter($(".superlative-line").last());
    },

    deleteSuperlative: function() {
        var deleteSuperlativeButton = $("#delete-sprint-superlative");

        $(".superlative-line").last().remove();
        if ($(".superlative-line").length == 1) {
            deleteSuperlativeButton.remove();
        } else {
            deleteSuperlativeButton.detach();
            $(".superlative-line").last().append(deleteSuperlativeButton);
        }
    },

    addSprint: function() {
        var options = {};
        options.startDate = $("#start-date").datepicker("getDate");
        options.endDate = $("#end-date").datepicker("getDate");
        options.endDate.setHours(23,59,59,999);
        console.log(options.endDate);
        options.superlatives = [];
        $(".new-sprint-superlative").each(function() {
            options.superlatives.push({name:$(this).val(),responses:[]});
        });
        options.sprintNumber = this.sprints.getNextSprintNumber();
        var sprint = new Sprint(options);
        var self = this;
        $('#add-sprint-modal').on('hidden.bs.modal', function (e) {
            sprint.save({},{success:function() {
                self.adminView.refreshSprintView();
            }});
        });
        $('#add-sprint-modal').modal("hide");

    },

    deleteSprint: function(e) {
        var self = this;
        var sprint = this.sprints.get(e.target.id.substring(7));
        var sprintQuestions = sprint.get("questions");
        sprint.destroy().then(function() {
            self.sprints.fetch().then(function() {
                self.sprints.each(function(otherSprint) {
                    var usedQuestions = otherSprint.get("questions");
                    _.each(usedQuestions, function(usedQuestion) {
                        var index = sprintQuestions.indexOf(usedQuestion);
                        if (index>-1) {
                            sprintQuestions.splice(index, 1);
                        }
                    });
                });
                var allQuestions = new QuestionCollection();
                allQuestions.fetch().then(function() {
                    _.each(sprintQuestions, function(sprintQuestion) {
                        var questionModel = allQuestions.get(sprintQuestion);
                        questionModel.set({used:false});
                        Backbone.sync("update", questionModel);
                    });
                });

                self.adminView.refreshSprintView();
            });
        }, null);
    },

    openSurvey: function(e) {
        var sprint = this.sprints.get(e.target.id.substring(12));
        sprint.set({open:true});
        Backbone.sync("update", sprint);
        $(e.target).replaceWith('<button class="btn btn-default close-survey-button" id="close-survey-'+sprint.get("_id")+'">Close survey</button><button class="btn btn-primary end-sprint-button" id="end-sprint-'+sprint.get("_id")+'">Close survey and end sprint</button>');
    },

    closeSurvey: function(e) {
        var sprint = this.sprints.get(e.target.id.substring(13));
        sprint.set({open:false});
        Backbone.sync("update", sprint);
        $(e.target).replaceWith('<button class="btn btn-primary open-survey-button" id="open-survey-'+sprint.get("_id")+'">Open survey</button>');
        $("#end-sprint-"+sprint.get("_id")).remove();
    },

    endSprint: function(e) {
        var sprint = this.sprints.get(e.target.id.substring(11));
        sprint.set({open:false});
        var self = this;
        sprint.deactivate().then(function() {
            Backbone.sync("update", sprint).then(function() {
                self.adminView.refreshSprintView();
            }, null);
        }, null);

    }


});