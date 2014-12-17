'use strict';
var db = require('../db')
  , _ = require('underscore')
  , config = require('../config')
  , logger = require('../logger').logger
  , common = require('../common');

/**
 * @api {get} /api/config Retrieve pastebin configuration
 * @apiName getConfig
 * @apiGroup Posts
 * @apiVersion 1.0.0
 *
 * @apiDescription
 *  Gets a subset of the configuration to let the client know things 
 *  like the maximum number of characters in a post, the supported
 *  expiry times, and the supported languages.
 *
 * @apiSuccessExample {json} Successful Response
 * {
 *    "postRestrictions" : {
 * 		"titleLength": 50,
 * 		"pasteLength" : 524288
 *    },
 *    "supportedExpiryTimes" : [
 *        { label: "Never", time: 0 },
 *        { label: "5 Minutes", time: 5 },
 *        ...
 *    ],
 *    "supportedLanguages" : [
 *       {name: "C#", mime: "text/x-csharp", mode: "clike", ext: ["cs"], alias: ["csharp"]},
 *       ...
 *    ]
 * } */
exports.getConfig = function(req,res) {
	return res.status(200).send({
		postRestrictions: config.postRestrictions,
		supportedExpiryTimes: config.supportedExpiryTimes,
		supportedLanguages: config.supportedLanguages
	});
};
  
/**
 * @api {get} /api/recent Retrieve recent posts
 * @apiName getRecentPosts
 * @apiGroup Recent Posts
 * @apiVersion 1.0.0
 *
 * @apiDescription
 *  Gets a list of recent posts.
 *
 * @apiSuccessExample {json} Successful Response
 * {
 *    "posts": [
 *        {
 *            "title": "Test Post",
 *            "language": "csharp",
 *            "_id": "548b2cddf59e4ffc12000001"
 *        }
 *    ]
 *} */
exports.getRecentPosts = function(req,res) {
	var query = db.Post.find({ hidden: false }, 'title language _id', {limit: 10, sort: {'_id': -1}});
	query.exec(function(err, posts) {
		if (err) {
			logger.warn("Error while getting recent posts: " + err.toString());
			return res.status(500).send('Failed to retrieve posts from database');
		}
		return res.status(200).send({posts: posts});
	});
	
};

/**
 * @api {get} /api/post/:postId Retrieve Post
 * @apiName getPost
 * @apiGroup Posts
 * @apiVersion 1.0.0
 *
 * @apiDescription
 *  Retrieves data for a post
 *
 * @apiSuccessExample {json} Successful Response
 * {
 *	 "paste" : "Console.WriteLine(\"Hello World\");",
 *   "title" : "Hello World Example",
 *   "language" : "csharp",
 *   "expiry": "2014-12-28T01:43:25.101Z",
 *   "expiryValue": 1440,
 *   "createdAt" : "2014-12-27T01:43:25.101Z",
 *   "hidden": true
 * } */
exports.getPost = function(req, res) {
	db.Post.findOne({
		_id : req.params.postId
	}, function (err, post) {
		if (err) {
			logger.warn("Error while getting post: " + err.toString());
			return res.status(500).send('Failed to retrieve post from database');
		}
		if (post) {
			return res.status(200).send({
				paste : post.paste
			  , title : post.title
			  , language : post.language
			  , expiry: post.expiry
			  , expiryValue: post.expiryValue
			  , createdAt: post.createdAt
			  , hidden: post.hidden
			});
		} else {
			return res.status(404).send('No such post');
		}
	});
};

/**
 * @api {post} /api/post Create Post
 * @apiName submitPost
 * @apiGroup Posts
 * @apiVersion 1.0.0
 *
 * @apiDescription
 *  Creates a new post
 *
 * @apiExample {JSON} Example Body
 * {
 *  "title" : "Hello World Example",
 *  "language": "C#",
 *  "paste" : "Console.WriteLine(\"Hello World\");"
 *  "hidden" : false,
 *  "expiry" : 3600
 * }
 * @apiSuccessExample {json} Successful Response
 * {
 *	 "id" : "548da7e05b7c3d9c09abd416",
 *   "deletePassword": "1234"
 * } */
exports.submitPost = function(req,res) {
	// check referrer, if required
	if (config.checkReferer && !common.isValidReferer(req.headers.referer)) {
		logger.warn('Blocked direct submit via referral \''+req.headers.referer+'\'');
		return res.status(403).send('Request not allowed due to referer mismatch');
	}
	
	// validate inputs
	if (_.keys(req.body).length === 0) {
		return res.status(400).send('Missing body in request');
	}
	if (!_.isString(req.body.title)) {
		return res.status(400).send('Missing title in body');
	}
	if (!_.isString(req.body.paste)) {
		return res.status(400).send('Missing content in body');
	}
	if (!_.isBoolean(req.body.hidden)) {
		return res.status(400).send('Missing hidden property in body');
	}
	if (!_.findWhere(config.supportedLanguages, {name: req.body.language})) {
		return res.status(400).send('Invalid or unsupported language');
	}
	if (!_.isNumber(req.body.expiry)) {
		return res.status(400).send('Missing expiry in body');
	} else {
		// limit the expiry time to an integer
		var expiry = parseInt(req.body.expiry);
		if (!_.some(config.supportedExpiryTimes,function(t) { return(t.time === expiry); })) {
			return res.status(400).send('Unsupported expiry time');
		} else {
			var dateValue = (new Date()).valueOf();
			dateValue += expiry*60*1000; // expiry is in minutes but we need milliseconds
			var expiryTime = (new Date()).setTime(dateValue);
		}
	}
	var title = req.body.title.trim();
	// validate length of fields
	if(title.length > config.postRestrictions.titleLength) {
		return res.status(400).send('Title is too long');
	}
	if(req.body.paste.length > config.postRestrictions.pasteLength) {
		return res.status(400).send('Content is too long');
	}
	
	if (title.length == 0)
		title = null;
		
	var newPost = new db.Post({
			paste : req.body.paste,
			title : title,
			language : req.body.language,
			ip : common.getRemoteIp(req),
			hidden : req.body.hidden,
			expiryValue: req.body.expiry,
			expiry: expiryTime,
			deletepassword : (Math.round(Math.random()*8999)+1000).toString()
		});
	
	newPost.save(function (err, post) {
		if (err) {
			logger.warn('Error while saving post: ' + err.toString());
			return res.status(500).send('Failed to save post to database');
		}
		logger.info('new post from ' + post.ip + ' (lang:' + post.language + ' / id:' + post._id + ')');
		return res.status(200).json({ id: post._id, deletePassword: newPost.deletepassword });
	});
};

/**
 * @api {delete} /api/post/:postId Delete a post
 * @apiName deletePost
 * @apiGroup Posts
 * @apiVersion 1.0.0
 *
 * @apiDescription
 *  Deletes a post
 *
 * @apiExample {JSON} Example Body
 * {
 *  "password" : "1234",
 * } */
exports.deletePost = function(req, res) {
	db.Post.findOne({
		_id : req.params.postId
	}, function (err, post) {
		if (err) {
			logger.warn("Error while getting post: " + err.toString());
			return res.status(500).send('Failed to retrieve post from database');
		}
		if (post == null) {
			return res.status(404).send('No such post');
		}
		if (post.deletepassword !== req.body.password) {
			return res.status(401).send('Invalid password to delete post');
		}
		post.remove(function(err) {
			if (err) {
				logger.warn("Error while deleting post: " + err.toString());
				return res.status(500).send('Failed to delete post from database');
			}
			res.status(200).end();
		});
	});
};

/**
 * @api {get} /api/post/:postId/download Download Post As File
 * @apiName downloadPost
 * @apiGroup Posts
 * @apiVersion 1.0.0
 *
 * @apiDescription
 *  Sends the post content as a file download */
exports.downloadPost = function (req, res) {
	// check referrer, if required
	if (config.checkReferer && !common.isValidReferer(req.headers.referer)) {
		logger.warn('Blocked direct download via referral \''+req.headers.referer+'\'');
		res.redirect("/");
		return;
	}
	db.Post.findOne({
		_id : req.params.postId
	}, function (err, post) {
		var languageDetails = _.findWhere(config.supportedLanguages,{name:post.language});
		var fileName;
		if(languageDetails.ext) {
			fileName = post.title + '.' + languageDetails.ext[0];
		} else {
			fileName = post.title;
		}
		res.setHeader("content-disposition","attachment; filename=" + fileName);
		res.setHeader("content-type","application/octet-stream");
		res.status(200).send(post.paste);
	});
};