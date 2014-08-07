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
        //the array of sprint names
        this.makeLabelArray();
        var self = this;
        if (this.sprints.length>1) {
            var graphCount = 0;
            var allDatasets = [];
            //go through questions to make graphs for the necessary questions
            this.questions.each(function (question) {
                //if a question is multiple choice and has numerical answers, we can make a graph
                if (question.get("type") == "multipleChoice" && question.get("isNumerical") == true) {
                    var data = {};
                    data.labels = self.labels;
                    //make a pretty color to show this question's data
                    var color = self.getRandomColor();
                    var dataset = {
                        strokeColor: color,
                        pointColor: color,
                        pointStrokeColor: "#fff",
                        pointHighlightFill: "#fff",
                        pointHighlightStroke: color
                    };
                    dataset.label = question.get("questionText");

                    //put the data from each sprint into an array
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

                    //make the graph and append it
                    var chartView = new ChartView({data: data, name: question.get("questionText"), scale: 5, graphCount: graphCount});
                    $("#charts").append(chartView.el);

                    //put a new link on the sidebar to get to the graph
                    $("#stats-affix ul").append($('<li><a class="sprint-nav" href="#graph-'+graphCount+'">'+question.get("questionText")+'</a></li>'));
                    graphCount++;
                }
            });

            //same thing as for the questions, except for the response rate
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
            //also keep track of the response rate on a five point scale
            //so we can compare it to the other data later
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

            //compile all the data sets gathered to put them into one graph to compare them
            var totalData = {};
            totalData.labels = self.labels;
            totalData.datasets = allDatasets;
            var chartView = new ChartView({data: totalData, name: "Question Comparison", scale: 5, graphCount: graphCount});
            $("#charts").append(chartView.el);
            $("#stats-affix ul").append($('<li><a class="sprint-nav" href="#graph-'+graphCount+'">Question Comparison</a></li>'));
            graphCount++;

        }
        $("#stats-affix ul").append($('<li><a class="sprint-nav" href="#sprint-selection">Individual Sprints</a></li>'));

        //need this so when the window gets smaller the affix on the left keeps its space
        $( window ).resize(function() {
            self.fixMargin();
        });
        this.fixMargin();

        return this;
    },

    //make an array with all the sprint names to use for labels
    makeLabelArray: function() {
        this.labels = [];
        for (var i=1; i<=this.sprints.length; i++) {
            this.labels.push("Sprint "+i.toString());
        }
    },

    //changes the margin based on the page size so the affix and content don't overlap
    fixMargin: function() {
        if ($(this.el).offset().left<240) {
            $(this.el).css("margin-left", "+="+(240-$(this.el).offset().left));
        }
    },

    //an algorithm I found to make pretty pastel colors
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

    //on changing the sprint select, show the details of the chosen sprint
    newSprintView: function() {
        var sprint = this.sprints.find(function(sprint) {return sprint.get("sprintNumber") == $("#sprint-selection").val() });
        var sprintView = new SprintView({model: sprint});
        $("#sprint-details").empty();
        $("#sprint-details").append(sprintView.el);
    },

    //scrolls to different graphs when a link on the affix is pressed
    goToLocation: function(e) {
        e.preventDefault();
        $('html, body').animate({
            scrollTop: $(e.currentTarget.attributes.href.value).offset().top-60
        }, 1000);
    }
});

