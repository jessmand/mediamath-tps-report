window.utils = {

    // Asynchronously load templates located in separate .html files
    loadTemplate: function(views, callback) {

        var deferreds = [];

        $.each(views, function(index, view) {
            if (window[view]) {
                deferreds.push($.get('templates/' + view + '.html', function(data) {
                    window[view].prototype.template = _.template(data);
                }));
            } else {
                console.log(view + " not found");
            }
        });

        $.when.apply(null, deferreds).done(callback);
    },

    checkForUpdates: function() {
        var today = new Date();

        var sprintCollection = new SprintCollection();
        return sprintCollection.fetch().then(function () {
            if (sprintCollection.length == 0) {
                if (today.getDay() == 5) {
                    var endDate = new Date();
                    endDate.setHours(17,0,0,0);
                    var beginDate = new Date();
                    beginDate.setHours(9,0,0,0);
                    var newSprint = new Sprint({sprintNumber: 1, oldEndDate: endDate, oldBeginDate: beginDate});
                    return newSprint.deferred.then(function () {
                        return Backbone.sync("create", newSprint);
                    }, null)
                } else {
                    return $.Deferred;
                }

            } else {
                var lastSprint = sprintCollection.getLastSprint();
                if (today<lastSprint.get("endDate") && today>lastSprint.get("beginDate")) {
                    lastSprint.activate();
                    return $.Deferred;
                } else if (today>lastSprint.get("endDate") && lastSprint.get("active")) {
                    return lastSprint.deactivate().then(function() {
                        var newSprint = new Sprint({
                            sprintNumber: sprintCollection.getNextSprintNumber(),
                            oldEndDate: lastSprint.get("endDate"),
                            oldBeginDate: lastSprint.get("beginDate")
                        });
                        return newSprint.deferred.then(function () {
                            return Backbone.sync("create", newSprint);
                        }, null)
                    });

                } else {
                    return $.Deferred;
                }
            }
        }, null);

    }

};