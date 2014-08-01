window.ChartView = Backbone.View.extend({

    initialize: function (options) {
        this.data = options.data;
        this.name = options.name;
        this.scale = options.scale;
        this.render();
    },

    render: function () {
        $(this.el).html(this.template({name:this.name}));
        console.log(this.data);
        var ctx = $(".stats-chart", $(this.el)).get(0).getContext("2d");
        var self= this;
        var chart = new Chart(ctx).Line(this.data, {
            datasetFill : false,
            scaleOverride: true,
            scaleSteps:5,
            scaleStepWidth:self.scale/5,
            scaleStartValue:0
        });
        return this;
    }
});
