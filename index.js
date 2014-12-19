'use strict';
var config = require('./config'),
  controllers = require('./controllers'),
  middleware = require('./middleware'),
  logger = require('./logger').logger,
  express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  path = require('path');

// Configure Express.JS
if (config.trustProxy) {
  app.set('trust proxy', config.trustProxy);
}
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'static')));

/* API endpoints */
app.use('/api', middleware.appsecret);
app.get('/api/config', controllers.api.getConfig);
app.get('/api/recent', controllers.api.getRecentPosts);
app.get('/api/post/:postId', controllers.api.getPost);
app.get('/api/post/:postId/download', controllers.api.downloadPost);
app.get('/api/post/:postId/raw', controllers.api.rawPost);
app.post('/api/post', controllers.api.submitPost);
app.delete('/api/post/:postId', controllers.api.deletePost);


app.get('*', function(req, res) {
  res.sendFile(__dirname + '/static/' + 'index.html');
});

logger.info('pastebin.js started! listening on 0.0.0.0/' + config.listenport);
app.listen(config.listenport);