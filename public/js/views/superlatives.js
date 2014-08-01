window.SuperlativesView = Backbone.View.extend({

    initialize: function (options) {
        this.history = options.model;
        this.render();
    },

    render: function () {
        $(this.el).html(this.template({history:this.history}));
        return this;
    }
});
