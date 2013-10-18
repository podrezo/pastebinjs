# pastebin.js

Created by [Petro Podrezo](http://podrezo.com/). View project on [GitHub](https://github.com/podrezo/pastebinjs)

## About the project
PasteBin.JS is a pastebin implementation in node.js. A pastebin is a group of websites that allows people to share snippets of code or text quickly and easily over the web. PasteBin.JS uses express/dot for the backend and bootstrap for the frontend.


## Database
The database settings are configurable in db.js. By default you will need a local instance of mongodb with no authentication. The application will use a collection called "pastebinjs"

## Config.JSON
The config looks like this:

	{
		"listenport" : 8000,
		"checkReferer" : true,
		"maxRecentPosts" : 10,
		"postRestrictions" : {
			"titleLength": 50,
			"pasteLength" : 524288
		},
		"logFilePath" : "pastebin.log"
	}

The options are for the most part fairly self-explanatory but here's a brief explanation:

* *listenport* specifies what TCP port express should listen on.
* *checkReferer* validates the referrer for creating and downloading posts (to avoid hot-linking) if set to true. **Note:** you must update the regex in common.js for function isValidReferer() and set it to match your domain if you set this to true
* *maxRecentPosts* specified the maximum number of recent posts to appear in the dropdown in the top navigation.
* *postRestrictions* sets the limits and thresholds for post submissions.
* *logFilePath* sets where to write the logs to. This can be undefined if you do not want a saved log (it will output to the console regardless)

## Running the Application
Remember to run "npm install" to download all the dependencies before running the application.

Simply run node and point it at **index.js** as the entry point - the database must be already running.