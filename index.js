var gCal = require('google-calendar');
var auth = require('./auth.js');



var calendar = new gCal.GoogleCalendar(auth.googleToken);


var parseCalenderList = function parseCalenderData(data) {
  var slots = [];
  var interviews = [];
  data.items.forEach(function(event) {
    if (event.summary === 'Interview Duty') {
      slots.push(event);
    } else if (event.summary !== undefined && event.summary.includes('Applicant Interview:')) {
      interviews.push(event);
    }
  });
  return [slots, interviews];
};


calendar.events.list('hir.7@hackreactor.com', {'orderBy': 'startTime', 'singleEvents': true, 'timeMax': '2017-01-24T00:00:00-00:00', 'timeMin': '2017-01-23T00:00:00-00:00'}, function(err, calendarList) {
  if (err) {
    return console.log(err);
  }
  //console.log(parseCalenderList(calendarList));
});



