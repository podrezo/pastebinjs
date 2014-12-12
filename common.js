var crypto = require("crypto")
  , config = require('./config');

// gets a random string
exports.get_unique_string = function (numbytes) {
	return crypto.randomBytes(numbytes).toString('hex');
};

// compares strings
exports.strcmp = function(a, b) {
	if(typeof(a) === 'undefined' || typeof(b) === 'undefined') return -1000;
	if (a.toString() < b.toString()) return -1;
	if (a.toString() > b.toString()) return 1;
	return 0;
};
exports.strcmpi = function(a,b) {
	return(exports.strcmp(a.toString().toLowerCase(),b.toString().toLowerCase()));
};

// escapes special HTML characters
exports.escapeHTML = function(text,doNotTouchWhitespace) {
	if(typeof(text) === 'undefined') return('');
	var result = text.trim()
		.replace(/&/g,"&amp;")
		.replace(/</g,"&lt;")
		.replace(/>/g,"&gt;");
	if(typeof(doNotTouchWhitespace) === 'undefined' || !doNotTouchWhitespace)
	{
		result = result.replace(/\s+/g," ");
	}
	return(result);
}

// gets the remote IP from Express. Falls back to x-forwarded-for when available.
exports.getRemoteIp = function(req) {
	// get the remote IP
	var remotehost = req.connection.remoteAddress;
	if(typeof(req.headers["x-forwarded-for"]) !== 'undefined')
	{
		var forwardedFor = req.headers["x-forwarded-for"].split(",");
		remotehost = forwardedFor[forwardedFor.length-1].trim();
	}
	return remotehost;
}

// checks that the referer string is valid
exports.isValidReferer = function(ref) {
	if(typeof(ref) === 'undefined') return false;
	var result = 
		(ref.match(config.refererRegex) != null) ||
		(ref.match(/^http(s)?:\/\/localhost(:\d+)?\/.*?$/i) != null);
	return(result);
};

// copies all properties of 'src' to 'dest' and returns 'dest'
exports.copyObject = function(dest,src) {
	if(typeof(src) !== 'undefined') {
		if(!(src instanceof Array)) {
			src = [src];
		}
		for(var i in src) {
			for(var j in src[i]) {
				dest[j] = src[i][j];
			}
		}
	}
	return(dest);
}