var AppRouter = Backbone.Router.extend({

    routes: {
        ""                  : "home",
        "survey":"survey",
        "superlatives":"superlatives",
        "stats":"stats",
        "admin":"admin"
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
        this.headerView.selectMenuItem('stats-menu');
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

    admin: function() {
        utils.checkForUpdates().then(function() {
            $("#content").html(new AdminView().el);
        });
        this.headerView.selectMenuItem('admin-menu');
    }

});

utils.loadTemplate(['HomeView', 'HeaderView', 'SprintView', 'StatsView', 'SurveyView', 'SuperlativesView', 'MultipleChoiceView', 'FreeResponseView', 'VoteView', 'ChartView', 'AdminView'], function() {
    app = new AppRouter();
    Backbone.history.start();
});
