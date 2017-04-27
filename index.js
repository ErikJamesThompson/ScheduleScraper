var scraper = require('./scraper.js');

var command = process.argv.slice(2)[0] || '';


scraper.sendReportWithCommand(command);