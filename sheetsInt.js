var auth = require('./auth.js');
// var signiture = people.signiture;
var people = require('./constants.js');
var GoogleSpreadsheet = require('google-spreadsheet')
var googleGC = require('./google-generated-creds.json')


module.exports = {
  initializeSheetWrite(command) {
    var sheet = new GoogleSpreadsheet(auth.googleSpreadsheetKey)
    console.log(sheet)
    sheet.useServiceAccountAuth(auth.creds, (error, success) => {
      if(error) throw error
      else {
        sheet.getInfo(function(error, info) {
          if(error) throw error
          console.log(info)
        })
      }
    })
  }
}
