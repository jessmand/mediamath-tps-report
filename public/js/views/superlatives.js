window.SuperlativesView = Backbone.View.extend({

    initialize: function (options) {
        this.history = options.model;
        this.render();
    },

    render: function () {
        $(this.el).html(this.template({}));
        var self = this;
        //make a new image for each superlative in the history
        this.history.each(function(winner) {
            var historyCanvas = $("<canvas width='300' height='410'></canvas>");
            var superlativeTile = $("<div class='superlative-tile'></div>");
            superlativeTile.prepend(historyCanvas);
            $("#superlative-tiles", $(self.el)).prepend(superlativeTile);
            var ctx = historyCanvas[0].getContext("2d");

            //draw the image of the person
            var img = new Image();
            img.onload = function() {
                ctx.drawImage(img,0,70,300,300);
            };
            img.src = winner.get("person").image;

            //make a black rectangle at the top and bottom of the picture
            ctx.fillStyle = "#000000";
            ctx.fillRect(0,0,300,70);
            ctx.fillRect(0,370,300,40);

            //draw the mediamath logo on the picture
            var logoImg = new Image();
            logoImg.onload = function() {
                ctx.drawImage(logoImg,200,0,100,70);
            };
            logoImg.src = '../../pictures/logo.png';

            //write the superlative won at the top
            ctx.fillStyle = "#FFFFFF";
            ctx.font="30px Rockwell";
            ctx.fillText(winner.get("superlative").toUpperCase(),10,45,180);
            //write the name of the winner at the bottom
            ctx.font="24px Rockwell";
            ctx.textAlign="center";
            ctx.fillText(winner.get("person").name.toUpperCase(),150,400,280);

        });
        return this;
    }
});
