window.SurveyView = Backbone.View.extend({

    initialize: function (options) {
        this.sprint = options.sprint;
        this.error = undefined;
        if (Object.prototype.toString.call(this.sprint) == "[object Error]") {
            this.error = options.sprint;
        }
        var self = this;
        var questionList = new QuestionCollection();
        questionList.fetch({success: function(){
            self.questions = questionList;
            var people = new PersonCollection();
            people.fetch({success: function(){
                self.people = people;
                self.render();

            }, error: function() {
                self.error = new Error("Could not get people");
                self.render();
            }
            });
        },
        error: function() {
            self.error = new Error("Could not fetch list of questions");
            self.render();
        }});

    },

    events: {
        "click #submit-survey-button":"submit"
    },

    render: function () {
        if (this.error !== undefined) {
            $(this.el).html("<h2>"+this.error+"</h2>");
        } else {
            this.answers = [];
            $(this.el).html(this.template());

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
                answer.question = this.questions.at(i).get("_id");
                answer.questionType = this.questions.at(i).get("type");
                answer.view = view.el;
                this.answers.push(answer);
            }

            var voteView = new VoteView({sprint: this.sprint, people: this.people});
            console.log(this.sprint);
            $(this.el).append(voteView.el);
        }
        return this;
    },

    submit: function(e) {


        for (var i=0; i<this.answers.length; i++) {
            if (this.answers[i].questionType == "multipleChoice") {
                this.answers[i].response = $('input[type="radio"][value="1"]', $(this.answers[i].view)).val();
            } else if (this.answers[i].questionType == "freeResponse") {
                this.answers[i].response = $('textarea', $(this.answers[i].view)).val();
            }
            delete this.answers[i].view;
            delete this.answers[i].questionType;
        }

        var response = new Response({answers:this.answers});

        this.sprint.addResponse(response);
        var self = this;
        this.sprint.get("superlatives").each(function(superlative) {
            var selection = $("#superlative_"+superlative.get("_id")).val();

            var person = self.people.find(function (model) {
                return model.get('name') == selection;
            });
            superlative.get("responses").add(person);
        });


        Backbone.sync("update", this.sprint, {
            success: function () {
                console.log("save successful:");
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
