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

    //check if any of the sprints are over and thus need to be deactivated
    checkForUpdates: function() {
        var today = new Date();

        var sprintCollection = new SprintCollection();
        return sprintCollection.fetch().then(function () {
            if (sprintCollection.length > 0) {
                var deferred;
                while (true) {
                    var lastSprint = sprintCollection.getFirstUncompletedSprint();
                    if (lastSprint != undefined) {
                        if (today > lastSprint.get("endDate") && lastSprint.get("completed") == false) {
                            if (deferred == undefined) {
                                deferred = lastSprint.deactivate();
                            } else {
                                deferred.then(function () {
                                    return lastSprint.deactivate();
                                }, null)
                            }
                        } else {
                            break;
                        }
                    } else {
                        break;
                    }
                }
                if (deferred != undefined) {
                    return deferred;
                }
            }
        }, null);

    }

};