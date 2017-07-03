var auth = require('./auth.js');
// var signiture = people.signiture;
var people = require('./constants.js');
var GoogleSpreadsheet = require('google-spreadsheet')
var googleGC = require('./google-generated-creds.json')
var doc = new GoogleSpreadsheet(auth.googleSpreadsheetKey)
var helpers = require('./helpers')
var async = require('async')
let sheet;

module.exports = {
  // async.series([
  // ])

  createServiceAuth() {
    doc.useServiceAccountAuth(auth.creds, (error, success) => {
      if(error) throw error
      else {
        console.log('Now using sheet sheet:', auth.googleSpreadsheetKey)
      }
    })
  },
  setUpDocInfo() {
    doc.getInfo((error, info) => {
      if (error) throw error
      else {
        sheet = info.worksheets[0]
      }
    })
  },
  deletePreviousCells() {
    sheet.getRows()
  },


  initializeSheetWrite(data) {
    // console.log('data 11, sheetsInt', data)
    doc.useServiceAccountAuth(auth.creds, (error, success) => {
      if(error) throw error
      else {
        doc.getInfo(function(error, info) {
          if(error) throw error
          else {
            sheet = info.worksheets[0]
          }
          console.log(sheet)
          let arrayDateObjs = helpers.formatDataForSheet(data)
          // console.log(arrayDateObjs)
          sheet.getRows({limit: 50}, (err,rows) => {
            console.log(rows)
            rows.forEach((row) => {
              row.del((err, success) => {
                if(err) throw err
              })
            })
          })
          // arrayDateObjs.forEach(el => {
          //   sheet.addRow(el, (err,row) => {
          //     if(err){
          //       throw err
          //       // console.log(row)
          //     }
          //   })
          // })
        })
      }
    })
  }
}
