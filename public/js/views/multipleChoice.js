window.MultipleChoiceView = Backbone.View.extend({

    initialize: function (options) {
        this.model = options.model;
        this.render();
    },

    render: function () {
        var question = this.model;
        //shows a multiple choice question with all of the options
        $(this.el).html(this.template({question:question}));

        return this;
    }
});
