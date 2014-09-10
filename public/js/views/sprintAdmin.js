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
        //on closing the new sprint modal, clear the modal
        $('#add-sprint-modal').on('hidden.bs.modal', function (e) {
            $("#start-date").datepicker("refresh");
            $("#end-date").datepicker("refresh");
            $(".superlative-line:not(:first)").remove();
            $("#new-sprint-superlative-1").val('');
        });
        //the start date must be after the end date of the last sprint
        var today = new Date();
        today.setHours(0,0,0,0);
        var lastEndDatePlus14 = null;
        var lastEndDatePlus1 = null;
        if (this.sprints.length>0) {
            lastEndDatePlus14 = new Date(this.sprints.last().get("endDate"));
            lastEndDatePlus14.setDate(lastEndDatePlus14.getDate()+14);
            lastEndDatePlus1 = new Date(this.sprints.last().get("endDate"));
            lastEndDatePlus1.setDate(lastEndDatePlus14.getDate()+1);
        }
        $( "#end-date" ).datepicker({
            defaultDate: lastEndDatePlus14,
            numberOfMonths: 2,
            minDate: lastEndDatePlus1
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

    //add a new line for a new superlative
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

    //delete the last line of superlatives
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

    //take the information from the modal to make a new sprint and save it
    //then refresh the view so we don't have to mess with updating the view
    addSprint: function() {
        var options = {};
        options.endDate = $("#end-date").datepicker("getDate");
        options.endDate.setHours(23,59,59,999);
        options.superlatives = [];
        $(".new-sprint-superlative").each(function() {
            options.superlatives.push({name:$(this).val(),responses:[]});
        });
        options.sprintName = $("#sprint-name").val();
        var sprint = new Sprint(options);
        var self = this;
        $('#add-sprint-modal').on('hidden.bs.modal', function (e) {
            sprint.save({},{success:function() {
                self.adminView.refreshSprintView();
            }});
        });
        $('#add-sprint-modal').modal("hide");

    },

    //delete a sprint
    //only allowed if it is the last sprint in the list and has not been completed
    deleteSprint: function(e) {
        var self = this;
        var sprint = this.sprints.get(e.target.id.substring(7));
        var sprintQuestions = sprint.get("questions");
        sprint.destroy().then(function() {
            self.sprints.fetch().then(function() {
                //find out if after deleting the sprint
                //all the questions we thought were being used by sprints are still being used
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

    //make the survey for a sprint available and replace the open survey button with close survey buttons
    openSurvey: function(e) {
        var sprint = this.sprints.get(e.target.id.substring(12));
        sprint.set({open:true});
        Backbone.sync("update", sprint);
        $(e.target).replaceWith('<button class="btn btn-default close-survey-button" id="close-survey-'+sprint.get("_id")+'">Close survey</button><button class="btn btn-primary end-sprint-button" id="end-sprint-'+sprint.get("_id")+'">Close survey and end sprint</button>');
    },

    //make the survey unavailable and replace the close survey button with an open survey button
    closeSurvey: function(e) {
        var sprint = this.sprints.get(e.target.id.substring(13));
        sprint.set({open:false});
        Backbone.sync("update", sprint);
        $(e.target).replaceWith('<button class="btn btn-primary open-survey-button" id="open-survey-'+sprint.get("_id")+'">Open survey</button>');
        $("#end-sprint-"+sprint.get("_id")).remove();
    },

    //make the survey unavailable, deactivate the sprint, then refresh the view
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