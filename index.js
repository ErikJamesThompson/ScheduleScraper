var scraper = require('./scraper.js');

var command = process.argv.slice(-1)[0] || '';


setInterval(function () {
  scraper.sendReportWithCommand(command);
}, 600000);

scraper.sendReportWithCommand(command);
