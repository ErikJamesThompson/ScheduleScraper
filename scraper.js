var gCal = require('google-calendar');
var generateFunnies = require('./funnies.js').generateFunnies;
var auth = require('./auth.js');
var people = require('./constants.js');
var refreshTokenPromise = require('./refresh.js').refreshTokenPromise;
var helpers = require('./helpers.js');

var nowDate = new Date(); // "Februry 10, 2017 11:13:00" "January 26, 2017 11:13:00" "January 30, 2017 11:13:00"
var tomorowDate = new Date(nowDate.getTime() + 86400000);
var twomorrowDate = new Date(nowDate.getTime() + 86400000 * 2);
var today = helpers.getDMY(nowDate);
var tomorow = helpers.getDMY(tomorowDate);
// if you want to look a day ahead
// var today = helpers.getDMY(tomorowDate);
// var tomorow = helpers.getDMY(twomorrowDate);
var calendar;

var options = {
  'orderBy': 'startTime',
  'singleEvents': true,
  'timeMax': `${tomorow[2]}-${tomorow[1]}-${tomorow[0]}T00:00:00-07:00`,
  'timeMin': `${today[2]}-${today[1]}-${today[0]}T00:00:00-07:00`
};

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


module.exports = {

  sendReportWithCommand: function(command, callback) {

    if (command !== 'self' && command !== 'broadcast' && command !== 'check') {
      console.log('Do you need some help?\n  "npm run check" --find availiable openings for today\n  "npm run team"  --send an email detailing the available slots to THE STAFF\n  "npm run self"  --send an email detailing the available slots to YOURSELF\n  "npm run help"  --display the available commands\n');
      return;
    }

    console.log(generateFunnies());
    refreshTokenPromise()
      .then(function(accesstoken) {
        console.log(generateFunnies());
        calendar = new gCal.GoogleCalendar(accesstoken);

        var queryPromises = [];
        for (var key in people.hirs) {
          queryPromises.push(queryCalenderPromise(key));
          console.log(generateFunnies());
        }

        return Promise.all(queryPromises);
      })
      .then(function(data) {
        console.log(generateFunnies());
        console.log('');
        helpers.sendTo(command, data);
        if (callback) {
          return callback(null, data)
        }
      })
      .catch(console.log);
  }

};


// make standalone script that you can run from your computer with node mailer (that also renews token)

// run the script locally
// figure out how to use env variables to store sensitive information
// create one worker script that renews token and sends email
//
// create a server with send to all, stop, and start routes
// instead of a cronjob, maybe a set interval with a flag that you can toggle?
  // run interval every 10 minutes
    // if the flag is set to on, and the time is in between a set span of 10 minutes, and its not sunday <-+
 // need to make a little test to see if you can change the value of a variable out from under the function|in a setInterval
// make the routes run the appropriate function and redirect back to mail                                  |
//                                                                                                         |
// it would invoke the function, which refreshes the token, then sends ME the piece of mail   <------------+

// add tests that test all the functions
// add continuous integration
