var auth = require('./auth.js');
// var signiture = people.signiture;
var people = require('./constants.js');
var GoogleSpreadsheet = require('google-spreadsheet')
// var googleGC = require('./google-generated-creds.json')
var doc = new GoogleSpreadsheet(auth.googleSpreadsheetKey)
var helpers = require('./helpers')
let sheets
let sheet

//set up authentication and connect to specified set of sheets
function createServiceAuth() {
  return new Promise((res, rej) => {
    doc.useServiceAccountAuth(auth.creds, (error, success) => {
      if(error){
         rej(error)
       }
      else {
        console.log('Now using sheet sheet:', auth.googleSpreadsheetKey)
        res()
      }
    })
  })
}

//specify sheet to write to/update
//using the first sheet currently but can be changed to ".include" whatever
  //title is used for the sheet
function setUpDocInfo() {
  return new Promise((res, rej) => {
    doc.getInfo((error, info) => {
      if (error) {
        rej(error)
      }
      else {
        sheets = info.worksheets
        sheet = info.worksheets[0]
        res()
      }
    })
  })
}

//V3 addition of a data management sheet to contain previous values
//will auto write to the second sheet in the set of sheets
function writeToHistory(data){
  var secondSheet = sheets[1]
  var arrayCells
  return new Promise((res, rej) => {
    sheet.getCells({'min-row': 4, 'max-row' : (data.length + 3),'min-col' : 1,
    'max-col': 10, 'return-empty' : true}, (err, cells) => {
      if (err) {
        rej(err)
      }
      for(let i = 0; i < ((data.length) * 10); i++){
        arrayCells = cells[i]
      }
      secondSheet.bulkUpdateCells(arrayCells)
      res()
    })
  })
}

//updating the cells currently used to a blank value
//preparation for writing the new values
function deletePreviousCells(data) {
  return new Promise((res, rej) => {
    sheet.getCells({'min-row': 4, 'max-row' : (data.length + 3),'min-col' : 1,
    'max-col': 10, 'return-empty' : true}, (err, cells) => {
      if (err) {
        rej(err)
      }
      for(let i = 0; i < ((data.length) * 10); i++){
        //going to do a bulk update to a blank value ('')
        cells[i].value = ''
      }
      sheet.bulkUpdateCells(cells)
      res()
    })
  })
}

//actually write the data recieved to the sheet
function writeToSheet(data){
  return new Promise((res, rej) => {
    let arrayDateObjs = helpers.formatDataForSheet(data)
    sheet.getCells({'min-row': 4, 'max-row' : (arrayDateObjs.length + 3),
    'min-col' : 1, 'max-col': 10, 'return-empty' : true}, (err, cells) => {
      for(let i = 0; i < ((arrayDateObjs.length) * 10); i++){
        if (err) {
          rej(err)
        }
        // handle the boolean values so they don't screw up on the sheet
        if(arrayDateObjs[cells[i].row - 4][cells[i].col - 1] === true ||
          arrayDateObjs[cells[i].row - 4][cells[i].col - 1] === false){

            arrayDateObjs[cells[i].row - 4][cells[i].col - 1] =
            JSON.stringify(arrayDateObjs[cells[i].row - 4][cells[i].col - 1])
          }

          // use a custom function to dynamically write if the calendars contain
          //certain values
          //e.g. if the employees can conduct mock interviews
          if(arrayDateObjs[cells[i].row - 4][cells[i].col - 1] === 'No'){
            cells[i].value = `=IF(OR(TRIM(G${cells[i].row}) = "",
            TRIM(H${cells[i].row}) = ""),"No","Yes" )`
          } else {
            //otherwise, just write the values
            cells[i].value = arrayDateObjs[cells[i].row - 4][cells[i].col - 1]
          }
        }
        sheet.bulkUpdateCells(cells)
        res()
      })
  })
}

module.exports = {
  initializeSheetWrite(data) {
    createServiceAuth()
    .then((res) => {
      setUpDocInfo()
    })
    .then((res) => {
      writeToHistory()
    })
    .then((res) => {
      deletePreviousCells(res)
    })
    .then((res) => {
      writeToSheet(data)
    })
    .catch((err) => {
      throw err
    })
  },

  // initializeSheetWrite(data) {
  //   doc.useServiceAccountAuth(auth.creds, (error, success) => {
  //     if(error) throw error
  //     else {
  //       doc.getInfo(function(error, info) {
  //         console.log('here2')
  //         if(error) throw error
  //         else {
  //           sheet = info.worksheets[0]
  //         }
  //         let arrayDateObjs = helpers.formatDataForSheet(data)
  //
  //           sheet.getCells({'min-row': 4, 'max-row' : (arrayDateObjs.length + 3),
  //           'min-col' : 1, 'max-col': 10, 'return-empty' : true}, (err, cells) => {
  //
  //             for(let i = 0; i < ((arrayDateObjs.length) * 10); i++){
  //               if(arrayDateObjs[cells[i].row - 4][cells[i].col - 1] === true ||
  //                  arrayDateObjs[cells[i].row - 4][cells[i].col - 1] === false){
  //
  //                 arrayDateObjs[cells[i].row - 4][cells[i].col - 1] =
  //                 JSON.stringify(arrayDateObjs[cells[i].row - 4][cells[i].col - 1])
  //               }
  //               if(arrayDateObjs[cells[i].row - 4][cells[i].col - 1] === 'No'){
  //                   cells[i].value = `=IF(OR(TRIM(G${cells[i].row}) = "",
  //                    TRIM(H${cells[i].row}) = ""),"No","Yes" )`
  //               } else {
  //                 cells[i].value = arrayDateObjs[cells[i].row - 4][cells[i].col - 1]
  //               }
  //             }
  //             console.log(cells)
  //             sheet.bulkUpdateCells(cells)
  //           })
  //       })
  //     }
  //   })
  // }

}
