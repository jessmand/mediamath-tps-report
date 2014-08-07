window.FreeResponseView = Backbone.View.extend({

    initialize: function (options) {
        this.model = options.model;
        this.render();
    },

    render: function () {
        var question = this.model;
        //shows a free response question with a text area
        $(this.el).html(this.template({question:question}));

        return this;
    }
});
