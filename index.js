var gCal = require('google-calendar');
var auth = require('./auth.js');
var people = require('./constants.js');

var nowDate = new Date("Februry 10, 2017 11:13:00");
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

var queryPromises = [];
for (var key in people.hirs) {
  queryPromises.push(queryCalenderPromise(key));
}

Promise.all(queryPromises)
  .then(function(data) {
    console.log(organizeOpenings(flatten(data)));
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
  var results = openings.reduce(function(acc, crr){
    if (acc[crr[1]] === undefined) {
      acc[crr[1]] = [crr[2], [crr[0]]];
      return acc;
    } else {
      acc[crr[1]][1].push(crr[0]);
      return acc;
    }
  }, {});
  return results;
}









