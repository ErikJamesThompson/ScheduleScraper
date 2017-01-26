var gCal = require('google-calendar');
var auth = require('./auth.js');
var people = require('./constants.js');
var sendmail = require('sendmail')();
var signiture = 'Dylan Larrabee';

var nowDate = new Date(); // "Februry 10, 2017 11:13:00"
var tomorowDate = new Date(nowDate.getTime() + 86400000);
var today = getDMY(nowDate);
var tomorow = getDMY(tomorowDate);

var calendar = new gCal.GoogleCalendar(auth.googleToken);

var options = {
  'orderBy': 'startTime', 
  'singleEvents': true, 
  'timeMax': `${tomorow[2]}-${tomorow[1]}-${tomorow[0]}T00:00:00-07:00`, 
  'timeMin': `${today[2]}-${today[1]}-${today[0]}T00:00:00-07:00`
};

// var test1 = [ 
//   [ '12:00 - 1:00', 'Savaughn', 'hir.5@hackreactor.com' ],
//   [ '12:00 - 1:00', 'Susan', 'hir.11@hackreactor.com' ],
//   [ '12:00 - 1:00', 'Autumn', 'hir.12@hackreactor.com' ],
//   [ '1:00 - 2:00', 'Robin', 'hir.2@hackreactor.com' ],
//   [ '1:00 - 2:00', 'Bill', 'hir.1@hackreactor.com' ],
//   [ '2:00 - 3:00', 'Susan', 'hir.11@hackreactor.com' ],
//   [ '3:00 - 4:00', 'Bill', 'hir.1@hackreactor.com' ],
//   [ '4:00 - 5:00', 'Dylan', 'hir.7@hackreactor.com' ],
//   [ '4:00 - 5:00', 'Susan', 'hir.11@hackreactor.com' ],
//   [ '6:00 - 7:00', 'Autumn', 'hir.12@hackreactor.com' ] ];

// var test2 = [[ '12:00 - 1:00', 'Savaughn', 'hir.5@hackreactor.com' ]];

// var test3 = [];

// sendTo('me', test3);


var queryPromises = [];
for (var key in people.hirs) {
  queryPromises.push(queryCalenderPromise(key));
}

Promise.all(queryPromises)
  .then(function(data) {
    sendTo('me', organizeOpenings(flatten(data)));
  })
  .catch(console.log);


// //////////////////////////////////////////////////////////////

function queryCalenderPromise(hirNumber) {

  return new Promise(function(resolve, reject) {
    calendar.events.list(`hir.${hirNumber}@hackreactor.com`, options, function(err, calendarList) {
      if (err) {
        reject(err);
      }
      var data = parseCalenderList(calendarList);
      var freeSlots = findOpenings(data[0], data[1]);

      resolve(extractSlotsData(hirNumber, freeSlots));
    });
  });
}

function getDMY(dateObj) {
  var day = dateObj.getDate();
  if (day < 10) {day = '0' + day;}
  var month = dateObj.getMonth() + 1;
  if (month < 10) {month = '0' + month;}
  var year = dateObj.getFullYear();

  return [day, month, year];
}

function parseCalenderList(data) {
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
}  

function findOpenings(slots, interviews) {

  var freeSlots = slots.filter(function(slot) {
    var notFound = true;
    var slotTime = slot.start.dateTime.split('T')[1];
    interviews.forEach(function(interview) {
      var interviewTime = interview.start.dateTime.split('T')[1];
      if (slotTime === interviewTime) {
        notFound = false;
      }
    });
    return notFound;
  });

  return freeSlots;
     
}

function extractSlotsData(hirNumber, slots) {
  return slots.map(function(slot) {
    return [slot.start.dateTime, people.hirs[hirNumber][0], people.hirs[hirNumber][1]];
  });
}

function flatten(matrix) {
  var result = [];

  var spread = function(array) {
    if (array[0] && !Array.isArray(array[0][0])) {
      array.forEach(function(item) {
        result.push(item);
      });
      return;
    } else {
      array.forEach(function(item) {
        spread(item);
      });
    }
  };

  spread(matrix);

  return result;
}

function organizeOpenings(openings) {

  var results = openings.sort(function(a, b) {
    a = a[0].split('T')[1].split('-')[0].split(':');
    b = b[0].split('T')[1].split('-')[0].split(':');
    if (+a[0] > +b[0]) {
      return 1;
    } else if (+a[0] < +b[0]) {
      return -1;
    } else if (+a[1] > +b[1]) {
      return 1;
    } else if (+a[1] < +b[1]) {
      return -1;
    } else {
      return 0;
    }
  }).map(function(item) {
    var time = item[0].split('T')[1].split('-')[0].split(':');
    time[0] = +time[0];
    if (time[0] > 12) {
      time[0] -= 12;
    }
    time = time[0] + ':' + time[2] + ' - ' + (time[0] + 1 > 12 ? 1 : time[0] + 1) + ':' + time[2];
    return [time, item[1], item[2]];
  });

  return results;
}

function sendTo(param, openings) {

  var to;
  var subject;
  var message;
  
  if (param === 'me' || param === 'stop') {
    to = 'dylan.larrabee@hackreactor.com';
  } else if (param === 'team') {
    to = 'dylan.larrabee@hackreactor.com, sfm.technical.mentors.team@hackreactor.com, sfm.counselors.team@hackreactor.com';
  } 

  if (openings.length > 0) {
    subject = 'HiR Free Hours';
    if (param === 'me' || param === 'team') {
      message = "Good morning everyone!<br><br>Looks like we've got " + (openings.length) + ' unscheduled interview slot' + (openings.length > 1 ? 's' : '') + ' today.<br>The following time slot' + (openings.length > 1 ? 's ' : ' ') + (openings.length > 1 ? 'are' : 'is') + ' available:<br><br>';
      for (var i = 0; i < openings.length; i++) {
        message += openings[i][0] + ': ' + openings[i][1] + '<br>';
      }
      message += '<br>Thanks!<br>' + signiture;
    }
  } else {
    subject = 'No Free HiRs';
    message = 'Good morning everyone,<br>All of our HiRs are all fully booked today.<br><br>Sorry!<br>' + signiture;
  }

  if (param === 'me') {
    message += '<br><br>this message is just for me';
  }

  if (param === 'stop') {
    to = 'dylan.larrabee@hackreactor.com';
    subject = 'STOP';
    message = 'this is the stop message';
  }

  sendmail({
    from: 'dylan.larrabee@hackreactor.com',
    to: to,
    subject: subject,
    html: message,
  }, function(err, reply) {
    console.log(err && err.stack);
    console.dir(reply);
  });
  
}

// separate the files into a more organized structure
// run the script locally
// figure out how to use env variables to store sensitive information
// create one worker script that renews token and sends email
// 
//create a server with send to all, stop, and start routes
// instead of a cronjob, maybe a set interval with a flag that you can toggle?
  // run interval every 10 minutes
    // if the flag is set to on, and the time is in between a set span of 10 minutes, and its not sunday
 // need to make a little test to see if you can change the value of a variable out from under the function in a setInterval
// make the routes run the appropriate function and redirect back to mail






