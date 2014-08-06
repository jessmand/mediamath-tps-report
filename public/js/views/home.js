window.HomeView = Backbone.View.extend({

    initialize:function () {
        this.render();
    },

    render:function () {
        $(this.el).html(this.template());
        return this;
    },

    events: {
        "click #take-survey-button":"goToSurvey"
    },

    goToSurvey: function() {
        app.navigate("survey", {trigger:true});
    }

});