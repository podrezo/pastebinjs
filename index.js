'use strict';
var config = require('./config')
  , controllers = require('./controllers')
  , middleware = require('./middleware')
  , logger = require('./logger').logger
  , express = require('express')
  , app = express()
  , bodyParser = require('body-parser');

// Configure Express.JS
if(config.trustProxy) {
	app.enable('trust proxy');
}
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/static', express.static(__dirname + '/static'));

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/static/index.html');
});
app.get('/p/:postId', function (req, res) {
	res.sendFile(__dirname + '/static/index.html');
});
app.get('/about', function (req, res) {
	res.sendFile(__dirname + '/static/index.html');
});

/* API endpoints */
app.use('/api',middleware.appsecret);
app.get('/api/config',
	controllers.api.getConfig);
app.get('/api/recent',
	controllers.api.getRecentPosts);
app.get('/api/post/:postId',
	controllers.api.getPost);
app.get('/api/post/:postId/download',
	controllers.api.downloadPost);
app.post('/api/post',
	controllers.api.submitPost);
app.delete('/api/post/:postId',
	controllers.api.deletePost);


logger.info('pastebin.js started! listening on 0.0.0.0/' + config.listenport);
app.listen(config.listenport);