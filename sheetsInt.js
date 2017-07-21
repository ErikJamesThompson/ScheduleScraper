var auth = require('./auth.js');
// var signiture = people.signiture;
var people = require('./constants.js');
var GoogleSpreadsheet = require('google-spreadsheet')
// var googleGC = require('./google-generated-creds.json')
var doc = new GoogleSpreadsheet(auth.googleSpreadsheetKey)
var helpers = require('./helpers')
let sheet

module.exports = {
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
    sheet.getRows({limit: 30, offset: 1}, (err,rows) => {
      console.log(rows)
      if(rows.length > 0){
        rows.forEach((row) => {
          row.del((err, success) => {
            if(err) throw err
            module.exports.deletePreviousCells()
          })
        })
      } else {
        console.log('There aren\' any rows!')
      }
    })
  },
  writeToSheet(data){
    let arrayDateObjs = helpers.formatDataForSheet(data)
    sheet.getCells({'min-row': 4, 'max-row' : (arrayDateObjs.length + 3),'min-col' : 1, 'max-col': 10, 'return-empty' : true}, (err, cells) => {
      for(let i = 0; i < ((arrayDateObjs.length) * 10); i++){
        if(arrayDateObjs[cells[i].row - 4][cells[i].col - 1] === true || arrayDateObjs[cells[i].row - 4][cells[i].col - 1] === false){
          arrayDateObjs[cells[i].row - 4][cells[i].col - 1] = JSON.stringify(arrayDateObjs[cells[i].row - 4][cells[i].col - 1])
        }
        if(arrayDateObjs[cells[i].row - 4][cells[i].col - 1] === 'No'){
            cells[i].value = `=IF(OR(TRIM(G${cells[i].row}) = "", TRIM(H${cells[i].row}) = ""),"No","Yes" )`
        } else {
          cells[i].value = arrayDateObjs[cells[i].row - 4][cells[i].col - 1]
        }
      }
      sheet.bulkUpdateCells(cells)
    })
  },
  writeToHistory(data){


  },

  initializeSheetWrite(data) {
    doc.useServiceAccountAuth(auth.creds, (error, success) => {
      if(error) throw error
      else {
        doc.getInfo(function(error, info) {
          console.log('here2')
          if(error) throw error
          else {
            sheet = info.worksheets[0]
          }
          let arrayDateObjs = helpers.formatDataForSheet(data)
          // console.log(arrayDateObjs)

          // sheet.getCells({min: 30, offset: 1}, (err,rows) => {
          //   console.log(rows)
          //   if(rows.length > 0){
          //     rows.forEach((row) => {
          //       row.del((err, success) => {
          //         if(err) throw err
          //         module.exports.deletePreviousCells()
          //       })
          //     })
          //   } else {
          //     console.log('There aren\' any rows!')
          //   }
          // })

          // arrayDateObjs.forEach(el => {
            // sheet.addRow(el, (err,row) => {
            //   if(err){
            //     throw err
            //     // console.log(row)
            //   }
            // })
            // })
            sheet.getCells({'min-row': 4, 'max-row' : (arrayDateObjs.length + 3),'min-col' : 1, 'max-col': 10, 'return-empty' : true}, (err, cells) => {
              for(let i = 0; i < ((arrayDateObjs.length) * 10); i++){
                if(arrayDateObjs[cells[i].row - 4][cells[i].col - 1] === true || arrayDateObjs[cells[i].row - 4][cells[i].col - 1] === false){
                  arrayDateObjs[cells[i].row - 4][cells[i].col - 1] = JSON.stringify(arrayDateObjs[cells[i].row - 4][cells[i].col - 1])
                }
                if(arrayDateObjs[cells[i].row - 4][cells[i].col - 1] === 'No'){
                    cells[i].value = `=IF(OR(TRIM(G${cells[i].row}) = "", TRIM(H${cells[i].row}) = ""),"No","Yes" )`
                } else {
                  cells[i].value = arrayDateObjs[cells[i].row - 4][cells[i].col - 1]
                }
              }
              sheet.bulkUpdateCells(cells)
            })
        })
      }
    })
  }
}
