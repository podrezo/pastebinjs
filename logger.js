var dateFormat = require('dateformat')
  , winston = require('winston')
  , config = require('./config');

var transports;
if(typeof(config.logFilePath) !== 'undefined') {
	transports = [
      new (winston.transports.Console)({ colorize: true })
      , new (winston.transports.File)({ filename: config.logFilePath, timestamp:function() { return dateFormat(); }, handleExceptions: true, json: false })
    ];
} else {
	transports = [
      new (winston.transports.Console)({ colorize: true })
    ];
}
  
  
var logger = new (winston.Logger)({
    transports: transports
  });
  
exports.logger = logger;
