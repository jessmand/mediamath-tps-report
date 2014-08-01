var AppRouter = Backbone.Router.extend({

    routes: {
        ""                  : "home",
        "survey":"survey",
        "superlatives":"superlatives",
        "sprints/:id":"sprintDetails",
        "sprints":"stats"
    },

    initialize: function () {
        this.headerView = new HeaderView();
        $('.header').html(this.headerView.el);
    },

    home: function () {
        if (!this.homeView) {
            this.homeView = new HomeView();
        }
        $('#content').html(this.homeView.el);
        this.headerView.selectMenuItem('home-menu');
    },

    stats: function() {
        utils.checkForUpdates().then(function() {
            var sprintList = new SprintCollection();
            sprintList.fetch({success: function () {
                $("#content").html(new StatsView({model: sprintList}).el);
            }});
        });
        this.headerView.selectMenuItem('sprints-menu');
    },

    superlatives: function() {
        utils.checkForUpdates().then(function() {
            var HistoryList = new HistoryCollection();
            return HistoryList.fetch({success: function () {
                $("#content").html(new SuperlativesView({model: HistoryList}).el);
            }});
        });
        this.headerView.selectMenuItem('superlatives-menu');
    },

    survey: function () {
        utils.checkForUpdates().then(function() {
            var sprintList = new SprintCollection();
            return sprintList.fetch().then(function () {
                var currentSprint = sprintList.getCurrentSprint();
                $("#content").html(new SurveyView({sprint: currentSprint}).el);
            }, null);
        });
        this.headerView.selectMenuItem('survey-menu');
    },

    sprintDetails: function(id) {
        var sprint = new Sprint({_id: id});
        sprint.fetch({success: function(){
            $("#content").html(new SprintView({model: sprint}).el);
        }});
        this.headerView.selectMenuItem('sprints-menu');
    }

});

utils.loadTemplate(['HomeView', 'HeaderView', 'SprintView', 'StatsView', 'SurveyView', 'SuperlativesView', 'MultipleChoiceView', 'FreeResponseView', 'VoteView', 'ChartView'], function() {
    app = new AppRouter();
    Backbone.history.start();
});
