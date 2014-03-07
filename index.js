var config = require(__dirname + '/config.json')
  , common = require(__dirname + '/common.js')
  , logger = require(__dirname + "/logger.js").logger
  , express = require("express")
  , app = express()
  , doT = require('express-dot')
  , pub = __dirname + '/public'
  , view = __dirname + '/views'
  , db = require(__dirname + '/db.js')
  , dateformat = require('dateformat')
  , md = require("node-markdown").Markdown
  , hljs = require('highlight.js')
  , _ = require("underscore");

// Configure Express.JS
app.configure(function () {
	app.use(express.bodyParser());
	app.set('views', view);
	app.set('view engine', 'dot');
	app.engine('html', doT.__express);
	app.use('/css', express.static(__dirname + '/public/css'));
	app.use('/fonts', express.static(__dirname + '/public/fonts'));
	app.use('/js', express.static(__dirname + '/public/js'));
	app.use('/ico', express.static(__dirname + '/public/ico'));
});

/* Load the list of languages 
 * There's quite a few so comment in the ones you don't need */
var languages = [
	{ name: 'Shell Script (bash)', alias: 'bash' },
	{ name: 'Erlang', alias: 'erlang' },
	{ name: 'C#', alias: 'cs' },
	//{ name: 'BrainFuck', alias: 'brainfuck' },
	{ name: 'Ruby-on-Rails', alias: 'ruby' },
	//{ name: 'Rust', alias: 'rust' },
	//{ name: 'rib', alias: 'rib' },
	{ name: 'Diff/Patch', alias: 'diff' },
	{ name: 'javascript', alias: 'javascript' },
	//{ name: 'glsl', alias: 'glsl' },
	//{ name: 'rsl', alias: 'rsl' },
	{ name: 'LUA', alias: 'lua' },
	{ name: 'XML', alias: 'xml' },
	{ name: 'Markdown', alias: 'markdown' },
	{ name: 'Cascading Style Sheets (CSS)', alias: 'css' },
	{ name: 'LISP', alias: 'lisp' },
	//{ name: 'profile', alias: 'profile' },
	{ name: 'HTTP', alias: 'http' },
	{ name: 'Java', alias: 'java' },
	{ name: 'PHP', alias: 'php' },
	{ name: 'Haskell', alias: 'haskell' },
	//{ name: '1c', alias: '1c' },
	{ name: 'Python', alias: 'python' },
	{ name: 'SmallTalk', alias: 'smalltalk' },
	{ name: 'Tex', alias: 'tex' },
	{ name: 'ActionScript', alias: 'actionscript' },
	{ name: 'SQL', alias: 'sql' },
	//{ name: 'vala', alias: 'vala' },
	{ name: 'ini (Configuration File)', alias: 'ini' },
	//{ name: 'd', alias: 'd' },
	//{ name: 'axapta', alias: 'axapta' },
	{ name: 'PERL', alias: 'perl' },
	{ name: 'Scala', alias: 'scala' },
	{ name: 'cmake', alias: 'cmake' },
	{ name: 'Objective C', alias: 'objectivec' },
	//{ name: 'avrasm', alias: 'avrasm' },
	{ name: 'VHDL', alias: 'vhdl' },
	{ name: 'CoffeeScript', alias: 'coffeescript' },
	{ name: 'Nginx', alias: 'nginx' },
	//{ name: 'erlang-repl', alias: 'erlang-repl' },
	{ name: 'R', alias: 'r' },
	{ name: 'JSON', alias: 'json' },
	{ name: 'Django', alias: 'django' },
	{ name: 'Delphi', alias: 'delphi' },
	{ name: 'vbScript', alias: 'vbscript' },
	//{ name: 'mel', alias: 'mel' },
	{ name: 'DOS', alias: 'dos' },
	{ name: 'Apache', alias: 'apache' },
	{ name: 'AppleScript', alias: 'applescript' },
	{ name: 'C++', alias: 'cpp' },
	{ name: 'MatLab', alias: 'matlab' },
	//{ name: 'parser3', alias: 'parser3' },
	//{ name: 'clojure', alias: 'clojure' },
	{ name: 'Go', alias: 'go' },
	{ name: 'Plain Text', alias: 'text' }
];

languages = languages.sort(function(a,b) { return common.strcmpi(a.name,b.name); });


/* Load the top 10 most recent posts
 * These are going to be populated into the top nav bar
 * We load them at program-start into an array and then maintain that array throughout instead of re-loading it every time. */
var recentPosts = [];
function postToRecent(value) { // converts a full post into a small snippet used for recent posts
	return {
		_id : value._id,
		title : value.title == null ? "Untitled Post" : value.title,
		added : value._id.getTimestamp(),
		language: value.language
	};
}
db.Post.find({
	hidden : false
}).sort({
	_id : -1
}).limit(10).exec(function (err, posts) {
	if (err) {
		logger.err("Error while finding recent posts: " + err.toString());
		process.exit(-1);
	}
	recentPosts = _.map(posts, function (value) {
			return postToRecent(value);
		});
	logger.info("loaded " + posts.length + " recent posts");
});

/*****************************
 * Express.JS Pages and URLs *
 *****************************/

/* Home and Submit page */
app.get('/', function (req, res) {
	res.render("index.html", {
		languages: languages,
		recentPosts : recentPosts,
		config: config,
		deleted : typeof(req.query.deleted) !== 'undefined',
        expired : typeof(req.query.expired) !== 'undefined',
		menuActiveSubmit : true
	});
});
/* View a post */
app.get('/p/:postid', function (req, res) {
	db.Post.findOne({
		_id : req.param('postid')
	}, function (err, post) {
		if (err) {
			logger.warn("Error while getting post: " + err.toString());
			res.send(500,"failed to retrieve post");
			return;
		}
		if (post == null) {
			res.send(404,"no such post");
			return;
		}
		// check if post is expired
		if(typeof(post.expiry) !== 'undefined' && post.expiry != null && post.expiry.valueOf() < (new Date()).valueOf()) {
			logger.info("attempted access of expired post "+req.param('postid'));
            res.redirect("/?expired");
			return;
		}
		// handling for special languages
		if (post.language == "markdown") {
			post.html = md(post.paste);
		}
		else if (post.language == "text") {
			post.html = "<pre>"+common.escapeHTML(post.paste,true)+"</pre>";
		}
		else {
			post.html = "<pre>"+hljs.highlight(post.language,post.paste).value+"</pre>";
		}
		post.paste = common.escapeHTML(post.paste, true);
		post.title = post.title == null ? null : common.escapeHTML(post.title);
		post.date = dateformat(post._id.getTimestamp(), "dddd, mmmm dS, yyyy, h:MM:ss TT");
		res.render("post.html", {
			languages: languages,
			recentPosts : recentPosts,
			config: config,
			deletepassword : req.query.deletepassword,
			post : post
		});
	});
});

/* Download a post */
app.get('/dl/:postid', function (req, res) {
	// check referrer, if required
	if (config.checkReferer && !common.isValidReferer(req.headers.referer)) {
		res.send(403,"invalid referrer");
		return;
	}
	db.Post.findOne({
		_id : req.param('postid')
	}, function (err, post) {
		if (err) {
			logger.warn("Error while getting post: " + err.toString());
			res.send(500,"failed to retrieve post");
			return;
		}
		if (post == null) {
			res.send(404,"no such post");
			return;
		}
		// check if post is expired
		if(typeof(post.expiry) !== 'undefined' && post.expiry != null && post.expiry.valueOf() < (new Date()).valueOf()) {
			logger.info("attempted access of expired post "+req.param('postid'));
			res.redirect("/?expired");
			return;
		}
		res.setHeader("content-disposition","attachment; filename=" + (post.title == null ? post.language : post.title+"_"+post.language ) +".txt");
		res.setHeader("content-type","application/octet-stream");
		res.send(post.paste);
	});
});
/* Submit a new post */
app.post('/', function (req, res) {
	// check referrer, if required
	if (config.checkReferer && !common.isValidReferer(req.headers.referer)) {
		res.send(403,"invalid referrer");
		return;
	}

	var title = req.body.title.trim();
	
	// validate length of fields
	if(title.length > config.postRestrictions.titleLength) {
		res.send(500,"title too long");
		return;
	}
	if(req.body.paste.length > config.postRestrictions.pasteLength) {
		res.send(500,"paste too long");
		return;
	}
	if(typeof(_.find(languages,function(lang) { return (lang.alias == req.body.lang); })) === 'undefined') {
		res.send(500,"invalid language");
		return;
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
			logger.warn("Error while saving post: " + err.toString());
			res.send(500,"failed to save post");
			return;
		}
		logger.info("new post from " + post.ip + " (lang:" + post.language + " / id:" + post._id + ")");
		if (!newPost.hidden) {
			recentPosts.unshift(postToRecent(newPost));
			if (recentPosts.length > config.maxRecentPosts)
				recentPosts.pop();
		}
		res.redirect("/p/" + post._id + "?deletepassword=" + newPost.deletepassword);
	});
});
/* Delete a post */
app.post('/delete/:postid', function (req, res) {
	db.Post.findOne({
		_id : req.param('postid')
	}, function (err, post) {
		if (err) {
			logger.warn("Error while getting post: " + err.toString());
			res.send(500,"failed to retrieve post");
			return;
		}
		if (post == null) {
			res.send(404,"no such post");
			return;
		}
		if (post.deletepassword != req.body.deletepassword) {
			res.send(403,"wrong password");
			return;
		}
		db.Post.remove({_id : req.param('postid')},function(err) {
			if (err) {
				logger.warn("Error while deleting post: " + err.toString());
				res.send(500,"failed to delete post");
				return;
			}
			res.redirect("/?deleted=success");
		});
	});
});

logger.info('pastebin.js started! listening on 0.0.0.0/' + config.listenport);
app.listen(config.listenport);