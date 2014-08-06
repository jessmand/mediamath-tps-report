var express = require('express'),
    path = require('path'),
    http = require('http');
survey = require('./routes/survey');



var app = express();

app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.use(express.logger('dev'));  /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser()),
        app.use(express.static(path.join(__dirname, 'public')));
});

app.get('/sprints', survey.getSprints);
app.get('/sprints/:id', survey.getSprint);
app.delete('/sprints/:id', survey.deleteSprint);
app.get('/responses', survey.getResponses);
app.post('/responses', survey.addResponse);
app.get('/people', survey.getPeople);
app.delete('/people/:id', survey.deletePerson);
app.post('/people', survey.addPerson);
app.get('/history', survey.getSuperlativeHistory);
app.post('/history', survey.addSuperlativeHistory);
app.get('/questions', survey.getQuestions);
app.post('/sprints', survey.addSprint);
app.put('/sprints/:id', survey.updateSprint);
app.post('/questions', survey.addQuestion);
app.put('/questions/:id', survey.updateQuestion);
app.delete('/questions/:id', survey.deleteQuestion);

http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});