'use strict';
var crypto = require('crypto')
  , config = require('./config');

// checks that the referer string is valid
exports.isValidReferer = function(ref) {
	if(typeof(ref) === 'undefined') return false;
	var result = 
		(ref.match(config.refererRegex) != null) ||
		(ref.match(/^http(s)?:\/\/localhost(:\d+)?\/.*?$/i) != null);
	return(result);
};