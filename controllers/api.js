'use strict';
var db = require('../db')
  , _ = require('underscore')
  , config = require('../config')
  , logger = require('../logger').logger
  , common = require('../common');

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
			  , hidden: post.hidden
			});
		} else {
			return res.status(404).send('No such post');
		}
	});
};

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
			language : req.body.lang,
			ip : common.getRemoteIp(req),
			hidden : typeof(req.body.hidden) !== 'undefined',
			deletepassword : (Math.round(Math.random()*8999)+1000).toString()
		});
	
	// get the proper expiry date
	var expiry = parseInt(req.body.expiry);
	if(!isNaN(expiry) && expiry > 0) {
		var dateValue = (new Date()).valueOf();
		dateValue += expiry*60*1000; // expiry is in minutes but we need milliseconds
		newPost.expiry = (new Date()).setTime(dateValue);
	}
	
	newPost.save(function (err, post) {
		if (err) {
			logger.warn('Error while saving post: ' + err.toString());
			return res.status(500).send('Failed to save post to database');
		}
		logger.info('new post from ' + post.ip + ' (lang:' + post.language + ' / id:' + post._id + ')');
		return res.status(200).json({ id: post._id, deletePassword: newPost.deletepassword });
	});
};

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
		if (post.deletepassword != req.query.password) {
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
		res.setHeader("content-disposition","attachment; filename=" + (post.title == null ? post.language : post.title+"_"+post.language ) +".txt");
		res.setHeader("content-type","application/octet-stream");
		res.status(200).send(post.paste);
	});
};