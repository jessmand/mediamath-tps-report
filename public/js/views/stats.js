window.StatsView = Backbone.View.extend({

    initialize: function (options) {
        this.sprints = new SprintCollection(options.model.getCompletedSprints());
        this.questions = new QuestionCollection();
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
            var graphCount = 0;
            var allDatasets = [];

            this.questions.each(function (question) {
                if (question.get("type") == "multipleChoice" && question.get("isNumerical") == true) {
                    var data = {};
                    data.labels = self.labels;
                    var color = self.getRandomColor();
                    console.log(color);
                    var dataset = {
                        strokeColor: color,
                        pointColor: color,
                        pointStrokeColor: "#fff",
                        pointHighlightFill: "#fff",
                        pointHighlightStroke: color
                    };
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
                    var chartView = new ChartView({data: data, name: question.get("questionText"), scale: 5, graphCount: graphCount});

                    $("#charts").append(chartView.el);
                    $("#stats-affix ul").append($('<li><a class="sprint-nav" href="#graph-'+graphCount+'">'+question.get("questionText")+'</a></li>'));
                    graphCount++;
                }
            });

            var responseData = {};
            responseData.labels = self.labels;
            var color = self.getRandomColor();
            var responseDataset = {
                strokeColor: color,
                pointColor: color,
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: color
            };
            responseDataset.label = "Response Rate";
            var responseDatasetFive = $.extend({}, responseDataset);
            var responseDataPointsOne = [];
            var responseDataPointsFive = [];
            self.sprints.each(function (sprint) {
                responseDataPointsOne.push(sprint.get("responseRate"));
                responseDataPointsFive.push(sprint.get("responseRate")*5);
            });
            responseDataset.data = responseDataPointsOne;
            responseDatasetFive.data = responseDataPointsFive;
            allDatasets.push(responseDatasetFive);
            responseData.datasets = [responseDataset];
            var chartView = new ChartView({data: responseData, name: "Response Rate", scale: 1, graphCount: graphCount});
            $("#charts").append(chartView.el);
            $("#stats-affix ul").append($('<li><a class="sprint-nav" href="#graph-'+graphCount+'">Response Rate</a></li>'));
            graphCount++;

            var totalData = {};
            totalData.labels = self.labels;
            totalData.datasets = allDatasets;
            var chartView = new ChartView({data: totalData, name: "Question Comparison", scale: 5, graphCount: graphCount});
            $("#charts").append(chartView.el);
            $("#stats-affix ul").append($('<li><a class="sprint-nav" href="#graph-'+graphCount+'">Question Comparison</a></li>'));
            graphCount++;

        }
        $("#stats-affix ul").append($('<li><a class="sprint-nav" href="#sprint-selection">Individual Sprints</a></li>'));
        $( window ).resize(function() {
            self.fixMargin();
        });
        this.fixMargin();
        return this;
    },

    makeLabelArray: function() {
        this.labels = [];
        for (var i=1; i<=this.sprints.length; i++) {
            this.labels.push("Sprint "+i.toString());
        }
    },

    fixMargin: function() {
        if ($(this.el).offset().left<240) {
            $(this.el).css("margin-left", "+="+(240-$(this.el).offset().left));
        }
    },

    getRandomColor: function() {
        var red = Math.round((Math.random()*256+255)/2);
        var blue = Math.round((Math.random()*256+255)/2);
        var green = Math.round((Math.random()*256+255)/2);
        return "rgba("+red+","+blue+","+green+",1)";
    },

    events: {
        "change #sprint-selection":"newSprintView",
        "click .sprint-nav":"goToLocation"
    },

    newSprintView: function() {
        var sprint = this.sprints.find(function(sprint) {return sprint.get("sprintNumber") == $("#sprint-selection").val() });
        var sprintView = new SprintView({model: sprint});
        $("#sprint-details").empty();
        $("#sprint-details").append(sprintView.el);
    },

    goToLocation: function(e) {
        e.preventDefault();
        $('html, body').animate({
            scrollTop: $(e.currentTarget.attributes.href.value).offset().top-60
        }, 1000);
    }
});

