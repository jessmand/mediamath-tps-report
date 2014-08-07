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

    //for the big "take the survey" button on the home page
    goToSurvey: function() {
        app.navigate("survey", {trigger:true});
    }

});