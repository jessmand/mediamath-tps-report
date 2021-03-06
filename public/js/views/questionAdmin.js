window.QuestionAdminView = Backbone.View.extend({

    initialize:function () {
        var self = this;
        this.questions = new QuestionCollection();
        this.questions.fetch().then(function() {
            self.render();
        }, null);
    },

    render:function () {
        $(this.el).html(this.template({questions:this.questions}));
        $("#new-question-choices-group").hide();
        //clear the new question modal when it's closed
        $('#add-question-modal').on('hidden.bs.modal', function (e) {
            $("#new-question-name").val('');
            $("#new-question-type").val('');
            $(".question-choice-line:not(:first)").remove();
            $("#new-question-choice-1").val('');
            $('#response-required').attr('checked','checked');
            $("#new-question-choices-group").hide();
        });
        return this;
    },

    events: {
        "click #add-new-question-choice":"addQuestionChoice",
        "click #delete-question-choice":"deleteQuestionChoice",
        "change #new-question-type":"selectQuestionType",
        "click #add-question-button":"addQuestion",
        "click .delete-question-button": "deleteQuestion",
        "click .activate-question-button":"activateQuestion",
        "click .deactivate-question-button":"deactivateQuestion"
    },

    //for the new choice button: adds a line and moves the x button to the last line
    addQuestionChoice: function(e) {
        e.preventDefault();
        var choiceNumber = $(".question-choice-line").length+1;
        var newChoice = $('<div class="col-sm-10"><input class="form-control new-question-choice" id="new-question-choice-'+choiceNumber+'" placeholder="Choice '+choiceNumber+'"></div>');
        if ($("#delete-question-choice").length == 0) {
            var deleteChoiceButton = $('<span class="glyphicon glyphicon-remove" id="delete-question-choice"></span>');
        } else {
            var deleteChoiceButton = $("#delete-question-choice");
            deleteChoiceButton.detach();
        }
        newChoice = newChoice.add(deleteChoiceButton);
        newChoice = newChoice.wrapAll('<div class="row question-choice-line"></div>').parent();
        newChoice.insertAfter($(".question-choice-line").last());
    },

    //deletes the last line of choices, and moves the x to the new last line
    deleteQuestionChoice: function() {
        var deleteChoiceButton = $("#delete-question-choice");

        $(".question-choice-line").last().remove();
        if ($("input", $("#new-question-choices-group")).length == 1) {
            deleteChoiceButton.remove();
        } else {
            deleteChoiceButton.detach();
            $(".question-choice-line").last().append(deleteChoiceButton);
        }
    },

    //show or hide the add choices part depending on whether the question type is free response or multiple choice
    selectQuestionType: function() {
        if ($("#new-question-type").val() == "freeResponse") {
            $("#new-question-choices-group").hide();
        } else {
            $("#new-question-choices-group").show();
        }
    },

    //get the information about the question from the modal
    //and save it as a model
    //and add a row to the table of questions
    addQuestion: function() {
        var options = {};
        options.questionText = $("#new-question-name").val();
        options.type = $("#new-question-type").val();
        if (options.type == "multipleChoice") {
            var choices = [];
            var isNumerical = true;
            $(".new-question-choice").each(function() {
                choices.push($(this).val());
                if (isNaN($(this).val())) {
                    isNumerical = false;
                }
            });
            options.isNumerical = isNumerical;
            options.choices = choices;
        }
        var question = new Question(options);
        var self= this;
        question.save({},{success: function() {
            self.questions.fetch().then(function() {
                var newRow = $("<tr></tr>");
                var firstCell = $("<td>"+question.get("questionText")+"</td>");
                var secondCell;
                if (question.get("type") == "multipleChoice") {
                    secondCell = $('<td>'+question.get("choices").join("; ")+'</td>')
                } else {
                    secondCell = $('<td><p class="text-muted">Free response</p></td>');
                }
                var thirdCell = $('<td><button class="btn btn-default deactivate-question-button" id="toggle-activate-'+question.get('_id')+'">Deactivate</button></td>');
                var fourthCell = $('<td><button class="btn btn-danger delete-question-button" id="delete-'+question.get('_id')+'">Delete</button></td>');
                newRow.append([firstCell, secondCell, thirdCell, fourthCell]);
                $("#question-table").append(newRow);
            }, null);
        }});
        $('#add-question-modal').modal('hide');
    },

    //remove the question from the collection and delete the row
    deleteQuestion: function(e) {
        $(e.target).parents("tr").remove();
        this.questions.get(e.target.id.substring(7)).destroy();
    },

    //activate the question: whether it will be pulled into any sprint created in the future
    activateQuestion: function(e) {
        var question = this.questions.get(e.target.id.substring(16));
        question.set({active:true});
        var self = this;
        Backbone.sync("update", question);
        $(e.target).replaceWith($('<button class="btn btn-default deactivate-question-button" id="toggle-activate-'+question.get('_id')+'">Deactivate</button>'));
    },

    //deactivate the question so it will not be pulled into a future sprint
    deactivateQuestion: function(e) {
        var question = this.questions.get(e.target.id.substring(16));
        question.set({active:false});
        var self = this;
        Backbone.sync("update", question);
        $(e.target).replaceWith($('<button class="btn btn-primary activate-question-button" id="toggle-activate-'+question.get('_id')+'">Activate</button>'));
    }

});