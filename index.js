var gCal = require('google-calendar');
var sendmail = require('sendmail')();
var auth = require('./auth.js');
var people = require('./constants.js');
var refreshTokenPromise = require('./refresh.js').refreshTokenPromise;
var helpers = require('./helpers.js');

var nowDate = new Date(); // "Februry 10, 2017 11:13:00" "January 26, 2017 11:13:00" "January 30, 2017 11:13:00"
var tomorowDate = new Date(nowDate.getTime() + 86400000);
var today = helpers.getDMY(nowDate);
var tomorow = helpers.getDMY(tomorowDate);
var calendar;

var options = {
  'orderBy': 'startTime', 
  'singleEvents': true, 
  'timeMax': `${tomorow[2]}-${tomorow[1]}-${tomorow[0]}T00:00:00-07:00`, 
  'timeMin': `${today[2]}-${today[1]}-${today[0]}T00:00:00-07:00`
};



refreshTokenPromise()
  .then(function(accesstoken) {
    calendar = new gCal.GoogleCalendar(accesstoken);
    
    var queryPromises = [];
    for (var key in people.hirs) {
      queryPromises.push(queryCalenderPromise(key));
    }

    return Promise.all(queryPromises);
  })
  .then(function(data) {
    helpers.sendTo('me', helpers.organizeOpenings(helpers.flatten(data)));
  })
  .catch(console.log);


// //////////////////////////////////////////////////////////////

function queryCalenderPromise(hirNumber) {

  return new Promise(function(resolve, reject) {
    calendar.events.list(`hir.${hirNumber}@hackreactor.com`, options, function(err, calendarList) {
      if (err) {
        reject(err);
      }
      var data = helpers.parseCalenderList(calendarList);
      var freeSlots = helpers.findOpenings(data[0], data[1]);

      resolve(helpers.extractSlotsData(hirNumber, freeSlots));
    });
  });
}




// move first part of organize to end of flatten
// email shows up as spam, refactor to not use the 'team' param
// separate the files into a more organized structure
// make standalone script that you can run from your computer with node mailer (that also renews token)

// run the script locally
// figure out how to use env variables to store sensitive information
// create one worker script that renews token and sends email
// 
//create a server with send to all, stop, and start routes
// instead of a cronjob, maybe a set interval with a flag that you can toggle?
  // run interval every 10 minutes
    // if the flag is set to on, and the time is in between a set span of 10 minutes, and its not sunday <-+
 // need to make a little test to see if you can change the value of a variable out from under the function|in a setInterval
// make the routes run the appropriate function and redirect back to mail                                  |
//                                                                                                         |
// it would invoke the function, which refreshes the token, then sends ME the piece of mail   <------------+

// add tests that test all the functions
// add continuous integration





