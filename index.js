var scraper = require('./scraper.js');
var sheets = require('./sheetsInt.js');
var async = require('async')
var helpers = require('./helpers.js')

var command = process.argv.slice(2)[0] || '';

if (command === 'sheets'){
  async.series([() => scraper.sendReportWithCommand('check', (err, result) => {
    result = helpers.organizeOpenings(helpers.flatten(result))
    sheets.initializeSheetWrite(result)
  })])
} else {
  scraper.sendReportWithCommand(command);
}
