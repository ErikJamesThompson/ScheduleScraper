// var sendmail = require('sendmail')();
var nodemailer = require('nodemailer');
var people = require('./constants.js');
var auth = require('./auth.js');
var signiture = people.signiture;

module.exports = {

  getDMY: function (dateObj) {
    var day = dateObj.getDate();
    if (day < 10) { day = '0' + day; }
    var month = dateObj.getMonth() + 1;
    if (month < 10) { month = '0' + month; }
    var year = dateObj.getFullYear();
    // console.log(day);
    return [day, month, year];
  },

  parseCalenderList: function (data) {
    var slots = [];
    var interviews = [];
    if (data.items) {
      data.items.forEach(function(event) {
        //had to change from 'Interview Duty' to '#Interview Duty'

        //FILLER
        if (event.summary.includes('Mock Interview')){
          if (event.attendees.length > 2){
            console.log('Interviews', event.summary)
            slots.push(event)
          } else {
            console.log('slots', event.summary)
            interviews.push(event)
          }
        }
        //FILLER

        if (event.summary === '#Interview Duty') { // || event.summary === 'Add Mock'Need to figure out better filter method
          slots.push(event);
          //had to add a check for the new system of assigning interviews
        } else if (event.summary !== undefined && (event.summary.includes('Applicant Interview:') || event.summary.includes('Interview Online'))) {
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
      return [slot.start.dateTime, people.hirs[hirNumber][0], people.hirs[hirNumber][1], people.hirs[hirNumber][2]];
    });
  },

  flatten: function (matrix) {
    var result = [];
    var spread = function(array) {
      if (array[0] && !Array.isArray(array[0][0])) {
        array.forEach(function(item) {
          // console.log('I am item', item);
          if (Array.isArray(item[0])) {
            spread(item);
          } else {
            result.push(item);
          }
        });
      } else {
        // console.log('hi I spread');
        array.forEach(function(item) {
          spread(item);
        });
      }
      return;
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
      // console.log(time);
      time[0] = +time[0];
      if (time[0] > 12) {
        time[0] -= 12;
      }
      time = time[0] + ':' + time[1] + ' - ' + (time[0] + 1 > 12 ? 1 : time[0] + 1) + ':' + time[1];
      return [time, item[1], item[2], item[3]];
    });

    return results;
  },

  formatDataForSheet: function (data) {
    let arrayDateObjs = []
    let d = new Date()

    //use for tomorrow
    // var tomorowDate = new Date(nowDate.getTime() + 86400000);
    // var twomorrowDate = new Date(nowDate.getTime() + 86400000 * 2);

    let n = d.toLocaleDateString()
    // n = n.split('/')[1] += 1
    // let date = n
    // console.log(date)
    data.forEach((el) => {
      if(parseInt(el[0]) >= 8){
        el[4] = 'AM'
      } else {
        el[4] = 'PM'
      }
      el = [n, el[0], el[4], el[1], el[2], 'No', '','','','Not Sent']
      arrayDateObjs.push(el)
    })
    return arrayDateObjs
  },

  buildEmail: function (param, openings) {
    openings = this.organizeOpenings(this.flatten(openings));


    var to = [people.email];
    var subject;
    var message;

    if (openings.length > 0) {
      subject = 'HiR Free Hours Today';
      message = 'Good morning everyone!\n\nThe following time slot' + (openings.length > 1 ? 's ' : ' ') + (openings.length > 1 ? 'are' : 'is') + ' available:\n\n';
      for (var i = 0; i < openings.length; i++) {
        message += openings[i][0] + ': ';
        message += openings[i][3] ? '***' : '';
        message += openings[i][1];
        message += openings[i][3] ? '***' : '';
        message += '\n';
      }
      message += '\nHiRs with "***" next to their name are able to do Mock Interviews if you know of any alumnus who need one ASAP\n\nReply all to claim!\n\nThanks!\n-' + signiture;
    } else {
      subject = 'No Free HiRs Today';
      message = 'Good morning everyone,\nAll of our HiRs are all fully booked today.\n\nSorry!\n' + signiture;
    }
    if (param === 'me') {
      // message += 'THIS PARTS FOR ME\n\nsfm.technical.mentors.team@hackreactor.com, sfm.counselors.team@hackreactor.com\nTo stop automatic emails, click here';
    }
    if (param === 'team') {
      to = people.team;
    }
    if (param === 'stop') {
      subject = 'STOPED';
      message = 'you are getting this message because you shut off auto emailing.\nTo resume, click here';
    }

    return {to: to, subject: subject, message: message};

  },

  sendTo: function(command, openings) {

    var mailOptions;

    if (command === 'check') {
      console.log('Free Time Slots----------');
      console.log(this.organizeOpenings(this.flatten(openings)));
      console.log('');
      return;
    } else if (command === 'broadcast') {
      var mail = this.buildEmail('team', openings);
      mailOptions = {
        from: '"' + signiture + '" <' + people.email + '>',
        to: mail.to,
        subject: mail.subject,
        text: mail.message
      };
    } else if (command === 'self') {
      var mail = this.buildEmail('me', openings);
      mailOptions = {
        from: '"' + signiture + '" <' + people.email + '>',
        to: mail.to,
        subject: mail.subject,
        text: mail.message
      };
    }

    // var transporter = nodemailer.createTransport('smtps://' + (process.env.USRNAME || auth.gmailUsername) + ':' + (process.env.PSWRD || auth.gmailPassword) + '@smtp.gmail.com');
    var transporter = nodemailer.createTransport('smtps://' + auth.gmailUsername + ':' + auth.gmailPassword + '@smtp.gmail.com');
    transporter.sendMail(mailOptions, function (error, response) {
      if (error) {
        console.log(error);
      } else {
        console.log('\nE-mail sent!\n');
        console.log('Accepted:', response.accepted);
        console.log('Rejected:', response.rejected);
        console.log('Response:', response.response);
        console.log('');
      }
    });
  }

};
