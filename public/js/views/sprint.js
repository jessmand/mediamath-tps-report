window.SprintView = Backbone.View.extend({

    initialize: function (options) {
        this.sprint = options.model;
        this.questions = new QuestionCollection();
        var self = this;
        this.questions.fetch().then(function() {
            self.render();
        });

    },

    render: function () {

        $(this.el).html(this.template({sprint:this.sprint, questions:this.questions}));
        $(this.el).css("margin-top", "20px");
        return this;
    }



});