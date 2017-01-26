var scraper = require('./scraper.js');

var command = process.argv.slice(-1)[0] || '';

scraper.sendReportWithCommand(command);
