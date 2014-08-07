window.SurveyView = Backbone.View.extend({

    initialize: function (options) {
        this.sprint = options.sprint;
        this.error = undefined;
        if (Object.prototype.toString.call(this.sprint) == "[object Error]") {
            this.error = options.sprint;
        }
        var self = this;
        if (this.error !== undefined) {
            this.render();
        } else {
            var questionList = new QuestionCollection();
            questionList.fetch({success: function () {

                //populate a collection of questions with the questions pulled into this sprint
                self.questions = new QuestionCollection();
                _.each(self.sprint.get("questions"), function (id) {
                    self.questions.add(questionList.get(id));
                });

                //get the people to show for choosing superlatives
                var people = new PersonCollection();
                people.fetch({success: function () {
                    self.people = people;
                    self.render();
                }});
            }});
        }

    },

    events: {
        "click #submit-survey-button":"submit"
    },

    render: function () {
        if (this.error !== undefined) {
            //display the error if there is one
            $(this.el).html("<h2>"+this.error+"</h2>");
        } else {
            this.answers = [];
            $(this.el).html(this.template({sprint:this.sprint}));

            //go through all the questions and make a new view to a view to append to the survey
            //based on what the question type is
            for (var i = 0; i < this.questions.length; i++) {
                var answer = {};
                var view;
                if (this.questions.at(i).get("type") == "multipleChoice") {

                    view = new MultipleChoiceView({model: this.questions.at(i)});

                    $('#survey', this.el).prepend(view.el);
                } else if (this.questions.at(i).get("type") == "freeResponse") {
                    view = new FreeResponseView({model: this.questions.at(i)});
                    $('#survey', this.el).prepend(view.el);
                }
                //get ready to collect answers!
                answer.question = this.questions.at(i).get("_id");
                answer.questionType = this.questions.at(i).get("type");
                answer.isNumerical = this.questions.at(i).get("isNumerical");
                answer.view = view.el;
                this.answers.push(answer);
            }

            var voteView = new VoteView({sprint: this.sprint, people: this.people});
            $(this.el).append(voteView.el);
        }
        return this;
    },

    //when the submit button in the voting view is pressed
    //collect the answers from the survey and from the superlatives and save them
    submit: function(e) {

        //get the answers from survey questions and put them into the answers
        for (var i=0; i<this.answers.length; i++) {
            if (this.answers[i].questionType == "multipleChoice") {
                this.answers[i].response = $('input[type="radio"]:checked', $(this.answers[i].view)).val();
            } else if (this.answers[i].questionType == "freeResponse") {
                this.answers[i].response = $('textarea', $(this.answers[i].view)).val();
            }
            delete this.answers[i].view;
        }
        //make a new response from the answers
        var response = new Response({answers:this.answers});
        this.sprint.addResponse(response);

        var self = this;
        var count = 0;
        _.each(this.sprint.get("superlatives"), function(superlative) {
            var selection = $("#superlative_"+count).val();
            superlative["responses"].push(selection);
            count++;
        });

        //go to the home page after the survey is successfully submitted
        Backbone.sync("update", this.sprint, {
            success: function () {
                $("#voting-modal").on("hidden.bs.modal", function() {
                    app.navigate("/", {trigger:true});
                });
                $('#voting-modal').modal('hide');


            },
            error: function () {
                console.log("error while saving response:", response);
            }
        });
    }
});
