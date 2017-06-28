var scraper = require('./scraper.js');
var sheets = require('./sheetsInt.js')

var command = process.argv.slice(2)[0] || '';

if (command === 'sheets'){
  sheets.initializeSheetWrite()
} else {
  scraper.sendReportWithCommand(command);
}
