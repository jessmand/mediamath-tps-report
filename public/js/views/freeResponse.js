window.FreeResponseView = Backbone.View.extend({

    initialize: function (options) {
        this.model = options.model;
        this.render();
    },

    render: function () {
        var question = this.model;
        $(this.el).html(this.template({question:question}));

        return this;
    }
});
