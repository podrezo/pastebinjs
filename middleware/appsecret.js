'use strict';
/* This middleware will check with config for a valid app id and app secret before allowing
 * the use of the API (unless the referer checks out) */
var db = require('../db')
  , _ = require('underscore')
  , config = require('../config')
  , logger = require('../logger').logger;

// The only export of this file is the middleware itself
module.exports = function (req, res, next) {
	var referer = req.headers.referer;
	// the request has a referrer, check it
	if(referer) {
		if((referer.match(config.refererRegex) !== null) || (referer.match(/^http(s)?:\/\/localhost(:\d+)?\/.*?$/i) !== null)) {
			// everything checks out, continue on
			return next();
		}
		// referrer mismatch, end the request
		else {
			logger.warn('Unauthorized referer type from ' + req.ip + ': ' + referer);
			res.status(403).send('Invalid/unallowed referer specified in HTTP request');
		}
	}
	else {
		var authHeader = req.headers.authorization;
		if(authHeader) {
			authHeader = authHeader.replace(/\s+/g,' ');
			if(authHeader.match(/^OAuth\s/)) {
				var pieces = authHeader.match(/\w+="[^"]+"/g);
				var pieceDict = [];
				_.each(pieces,function(piece) {
					var match = piece.match(/^(\w+)="([^"]+)"$/);
					pieceDict[match[1]] = match[2];
				});
				// now check the config
				var matchingApiCreds = _.findWhere(config.apiAccessControlList,{ app_id: pieceDict['app_id'], app_secret: pieceDict['app_secret'] });
				if(matchingApiCreds) {
					return next();
				}
				else {
					logger.warn('Unauthorized API credentials from ' + req.ip + ': ' + authHeader);
					res.status(403).send('Invalid app_id or app_secret specified in OAuth Authorization header. Check to make sure you included it in the config file on the server.');
				}
			}
			else {
				logger.warn('Unauthorized authentication type from ' + req.ip + ': ' + authHeader);
				res.status(403).send('Invalid authorization type');
			}
		}
		else {
			logger.warn('API request without referer or authorization blocked from ' + req.ip);
			res.status(403).send('Missing referer and authorization header - must specify one or the other to use this API');
		}
	}
};