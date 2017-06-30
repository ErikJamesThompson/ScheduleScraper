var auth = require('./auth.js');
// var signiture = people.signiture;
var people = require('./constants.js');
var GoogleSpreadsheet = require('google-spreadsheet')
var googleGC = require('./google-generated-creds.json')
var doc = new GoogleSpreadsheet(auth.googleSpreadsheetKey)
let sheet;

module.exports = {
  initializeSheetWrite(data) {
    // console.log('data 11, sheetsInt', data)
    doc.useServiceAccountAuth(auth.creds, (error, success) => {
      if(error) throw error
      else {
        doc.getInfo(function(error, info) {
          if(error) throw error
          data.forEach((el) => {
            if(parseInt(el[0]) >= 8){
              el[4] = 'AM'
            } else {
              el[4] = 'PM'
            }
            let obj = {
              time: el[0],
              name: el[1],
              email: el[2],
              mock: el[3],
              meridiem : el[4]
            }
            console.log
            doc.addRow(1,obj, (err,row) => {
              if(err){
                throw err
                // console.log(row)
              }
            })
          })
        })
      }
    })

  }
}
