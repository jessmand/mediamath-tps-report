window.VoteView = Backbone.View.extend({

    initialize: function (options) {
        this.sprint = options.sprint;
        this.people = options.people;
        this.render();


    },

    render: function () {
        //display a modal with the superlatives and all the people listed
        $(this.el).html(this.template({
            sprintNumber:this.sprint.get("sprintNumber"),
            superlatives:this.sprint.get("superlatives"),
            people:this.people
        }));

        return this;
    }
});
