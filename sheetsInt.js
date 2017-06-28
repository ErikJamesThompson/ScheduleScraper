var auth = require('./auth.js');
// var signiture = people.signiture;
var people = require('./constants.js');
var gSheet = require('google-spreadsheet')

function initializeSheetWrite(command) {
  var sheet = new gSheet(auth.googleSpreadsheetKey)

}
