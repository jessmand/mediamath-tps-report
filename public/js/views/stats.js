window.StatsView = Backbone.View.extend({

    initialize: function (options) {
        this.sprints = options.model;
        this.questions = new QuestionCollection();
        this.datasetProperties = {
            strokeColor: "rgba(220,220,220,1)",
            pointColor: "rgba(220,220,220,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(220,220,220,1)"};
        var self = this;
        this.questions.fetch().then(function() {
            self.render();
        });
    },

    render: function () {
        $(this.el).html(this.template({sprints:this.sprints}));
        this.makeLabelArray();
        var self = this;
        if (this.sprints.length>1) {
            var allDatasets = [];

            this.questions.each(function (question) {
                if (question.get("type") == "multipleChoice") {
                    var data = {};
                    data.labels = self.labels;
                    var dataset = $.extend({}, self.datasetProperties);
                    dataset.label = question.get("questionText");
                    var points = [];
                    self.sprints.each(function (sprint) {
                        if (question.get("_id") in sprint.get("questionAnswers")) {
                            points.push(sprint.get("questionAnswers")[question.get("_id")]);
                        } else {
                            points.push(null);
                        }
                    });
                    dataset.data = points;
                    allDatasets.push(dataset);
                    data.datasets = [dataset];
                    var chartView = new ChartView({data: data, name: question.get("questionText"), scale: 5});
                    $("#charts").append(chartView.el);
                }
            });

            var responseData = {};
            responseData.labels = self.labels;
            var responseDataset = $.extend({}, self.datasetProperties);
            responseDataset.label = "Response rate";
            var responseDataPointsOne = [];
            var responseDataPointsFive = [];
            self.sprints.each(function (sprint) {
                responseDataPointsOne.push(sprint.get("responseRate"));
                responseDataPointsFive.push(sprint.get("responseRate"));
            });
            responseDataset.data = responseDataPointsOne;
            var responseDatasetFive = {};
            responseDatasetFive.label = "Response rate";
            responseDatasetFive.data = responseDataPointsFive;
            allDatasets.push(responseDatasetFive);
            responseData.datasets = [responseDataset];
            var chartView = new ChartView({data: responseData, name: "Response rate", scale: 1});
            $("#charts").append(chartView.el);

            var totalData = {};
            totalData.labels = self.labels;
            totalData.datasets = allDatasets;
            var chartView = new ChartView({data: totalData, name: "Compare", scale: 5});
            $("#charts").append(chartView.el);
        }
        return this;
    },

    makeLabelArray: function() {
        this.labels = [];
        for (var i=1; i<=this.sprints.length; i++) {
            this.labels.push("Sprint "+i.toString());
        }
    },

    events: {
        "change #sprint-selection":"newSprintView"
    },

    newSprintView: function() {
        var sprint = this.sprints.find(function(sprint) {return sprint.get("sprintNumber") == $("#sprint-selection").val() });
        var sprintView = new SprintView({model: sprint});
        $("#sprint-details").empty();
        $("#sprint-details").append(sprintView.el);
    }
});

