window.ChartView = Backbone.View.extend({

    initialize: function (options) {
        this.data = options.data;
        this.name = options.name;
        this.scale = options.scale;
        this.graphCount = options.graphCount;
        this.render();
    },

    render: function () {
        $(this.el).html(this.template({name:this.name}));
        $(this.el).addClass("row chart-container");
        $(this.el).attr('id', 'graph-'+this.graphCount);
        var ctx = $(".stats-chart", $(this.el)).get(0).getContext("2d");
        var self= this;
        //the scale being passed in is necessary because response rate is 0-1 and the others are 1-5
        var chart = new Chart(ctx).Line(this.data, {
            datasetFill : false,
            scaleOverride: true,
            scaleSteps:5,
            scaleStepWidth:self.scale/5,
            scaleStartValue:0,
            legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><div class=\"palette\" style=\"background-color:<%=datasets[i].strokeColor%>\"></div><span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></span></li><%}%></ul>"
        });
        //uses legendTemplate to generate a list of the stats shown in a graph
        //only useful for the compare graph really
        var legend = $(chart.generateLegend());
        $(".legend-container", $(this.el)).append(legend);
        return this;
    }
});
