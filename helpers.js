var sendmail = require('sendmail')();
var nodemailer = require('nodemailer');
var people = require('./constants.js');
var signiture = 'Dylan Larrabee';
var auth = require('./auth.js');

module.exports = {

  getDMY: function (dateObj) {
    var day = dateObj.getDate();
    if (day < 10) {day = '0' + day;}
    var month = dateObj.getMonth() + 1;
    if (month < 10) {month = '0' + month;}
    var year = dateObj.getFullYear();

    return [day, month, year];
  },

  parseCalenderList: function (data) {
    var slots = [];
    var interviews = [];
    if (data.items) {
      data.items.forEach(function(event) {
        if (event.summary === 'Interview Duty') {
          slots.push(event);
        } else if (event.summary !== undefined && event.summary.includes('Applicant Interview:')) {
          interviews.push(event);
        }
      });
    }
    return [slots, interviews];
  },

  findOpenings: function (slots, interviews) {

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
  },

  extractSlotsData: function (hirNumber, slots) {
    return slots.map(function(slot) {
      return [slot.start.dateTime, people.hirs[hirNumber][0], people.hirs[hirNumber][1]];
    });
  }, 

  flatten: function (matrix) {
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
  },

  organizeOpenings: function (openings) {
    var results;
    results = openings.filter(function(item) {
      if (item.length > 0) {
        return true;
      }
    }).map(function(item) {
      if (Array.isArray(item[0])) {
        return item[0];
      } else {
        return item;
      }
    });

    if (openings.length > 1) {
      results = results.sort(function(a, b) {
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
      });
    }

    results = results.map(function(item) {
      var time = item[0].split('T')[1].split('-')[0].split(':');
      time[0] = +time[0];
      if (time[0] > 12) {
        time[0] -= 12;
      }
      time = time[0] + ':' + time[2] + ' - ' + (time[0] + 1 > 12 ? 1 : time[0] + 1) + ':' + time[2];
      return [time, item[1], item[2]];
    });

    return results;
  },

  sendTo: function (param, openings) {
    openings = this.organizeOpenings(this.flatten(openings));

    var to = ['dylan.larrabee@hackreactor.com'];
    var subject;
    var message;

    if (openings.length > 0) {
      subject = 'HiR Free Hours Today';
      message = "Good morning everyone!\n\nLooks like we've got " + (openings.length) + ' unscheduled interview slot' + (openings.length > 1 ? 's' : '') + ' today.\nThe following time slot' + (openings.length > 1 ? 's ' : ' ') + (openings.length > 1 ? 'are' : 'is') + ' available:\n\n';
      for (var i = 0; i < openings.length; i++) {
        message += openings[i][0] + ': ' + openings[i][1] + '\n';
      }
      message += '\nFeel free to reach out to me or the HiR directly if you have a task they can assist you with :D\nThanks!\n' + signiture;
    } else {
      subject = 'No Free HiRs Today';
      message = 'Good morning everyone,\nAll of our HiRs are all fully booked today.\n\nSorry!\n' + signiture;
    }
    if (param === 'me') {
      // message += 'THIS PARTS FOR ME\n\nsfm.technical.mentors.team@hackreactor.com, sfm.counselors.team@hackreactor.com\nTo stop automatic emails, click here';
    }
    if (param === 'team') {
      to = ['dylanlarrabee6@gmail.com', 'dylan.r.larrabee@gmail.com'];
    }
    if (param === 'stop') {
      subject = 'STOPED';
      message = 'you are getting this message because you shut off auto emailing.\nTo resume, click here';
    }
    console.log('message', message);
    // sendmail({
    //   from: 'dylan.larrabee@hackreactor.com',
    //   to: to,
    //   subject: subject,
    //   html: message,
    // }, function(err, reply) {
    //   console.log(err && err.stack);
    //   console.dir(reply);
    // });
    //////////////////////////

    var transporter = nodemailer.createTransport('smtps://' + auth.gmailUsername + ':' + auth.gmailPassword + '@smtp.gmail.com');
    var mailOptions = {
      from: '"Dylan Larrabee" <dylan.larrabee@hackreactor.com>',
      to: to,
      subject: subject,
      text: message
    };
    transporter.sendMail(mailOptions, function (error, response) {
      if (error) {
        console.log(error);
      } else {
        console.log('\nE-mail sent!\n\n');
        console.log(response);
      }
    });

  }

};
