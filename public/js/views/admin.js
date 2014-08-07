window.AdminView = Backbone.View.extend({

    initialize:function () {
        this.people = new PersonCollection();
        this.sprints = new SprintCollection();
        this.questions = new QuestionCollection();
        var self = this;

        self.sprints.fetch().then(function() {
            self.questions.fetch().then(function() {
                self.render();
            });
        });

    },

    render:function () {
        $(this.el).html(this.template({people:this.people, sprints: this.sprints, questions: this.questions}));

        this.currentView = new SprintAdminView({adminView: this});
        $("#sprints").append(this.currentView.el);
        var self = this;

        //handling the switching of tabs and rerendering of admin views
        $('#admin-tabs a').click(function (e) {
            e.preventDefault();
            self.currentView.remove();
            if ($(this).text() == "Sprints") {
                self.currentView = new SprintAdminView({adminView: self});
                $("#sprints").append(self.currentView.el);
            } else if ($(this).text() == "Questions") {
                self.currentView = new QuestionAdminView();
                $("#questions").append(self.currentView.el);
            } else if ($(this).text() == "People") {
                self.currentView = new PersonAdminView();
                $("#people").append(self.currentView.el);
            }
            $(this).tab('show');

        });

        return this;
    },

    //refreshing the sprint view so I don't have to handle changing the table manually
    //let the template handle it!
    //pass this function into the sprint view so it can call the function
    refreshSprintView:function() {
        this.currentView.remove();
        this.currentView = new SprintAdminView({adminView: this});
        $("#sprints").append(this.currentView.el);
    }



});