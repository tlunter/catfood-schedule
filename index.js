var bodyParser = require('body-parser');
var express = require('express');
var morgan = require('morgan');
var schedule = require('node-schedule');

var fed = false;

// Jobs

schedule.scheduleJob({ hour: 4, minute: 45 }, function () {
  console.log('Marking fed as false');
  fed = false;
});

schedule.scheduleJob({ hour: 15 }, function () {
  console.log('Marking fed as false');
  fed = false;
});

// Web Server

var app = express();

app.use(morgan('combined'));
app.use(express.static('public'));
app.use(bodyParser.json());

app.get('/fed', function (req, res) {
  res.json({ fed: fed });
});

app.put('/fed', function (req, res) {
  var fedParam = req.body.fed;

  if (fedParam === undefined) {
    fedParam = true;
  }

  fed = fedParam;

  res.status(204).end();
});

app.listen(3000, function () {
  console.log('App started on port 3000');
});
