# pastebin.js

Created by [Petro Podrezo](http://podrezo.com/). View project on [GitHub](https://github.com/podrezo/pastebinjs)

## About the project
PasteBin.JS is a pastebin implementation in node.js. A pastebin is a type of website that allows people to share snippets of code or text quickly and easily over the web. The key features of pastebin.js are:

* Elegant, modern UI written in Angular.JS with Bootstrap
* Includes CodeMirror (code editor with syntax highlighting) allowing improved editing capabilities over most other pastebins
* Fully documented REST API comes out of the box
* Free & open source (MIT License)

## Isn't that basically GitHub gists?
Sort of, but with this project you can run your own 'gist' repository instead of relying on GitHub. In itself this is a potential advantage for privacy reasons, however PasteBin.JS also allows syntax highlighting as you're editing the code online which Gists doesn't do. Moreover, no account of any kind is required to use pastebin.js - just paste and go and it has an API which allows you to create posts via other means than just the web.

## Configuration
The configuration file is `config.js` in the root directory. It should be more or less self-explanatory but here's a quick rundown of the options:
* `listenport` determines which TCP port the server will listen on. You can reverse proxy your Apache/NGINX installation to this port if you so choose.
* `checkReferer` is a boolean which determines if the download and submit endpoints will require a matching referrer to work.
* `refererRegex` is a regex for valid referrers. Ignored if `checkReferer` is set to false.
* `maxRecentPosts` is the number of posts to show in 'recent posts'
* `postRestrictions.titleLength` is the maximum number of characters in the title
* `postRestrictions.pasteLength` is the maximum number of characters in the body
* `supportedExpiryTimes` are the possible expiry times
* `supportedLanguages` are all the languages supported by the pastebin. This is identical to what is in CodeMirror's `meta.js` file. You can comment out as needed, but if you introduce new options then make sure you have the corresponding modes installed in the `static/cmmodes` directory.

## Database
The database settings are configurable in db.js. By default you will need a local instance of mongodb with no authentication. The application will use a collection called "pastebinjs"

## Running the Application
Remember to run `npm install` to download all the dependencies before running the application, then run `npm start` to start it.

# To-Do List

There are a few features that I would like to add sometime in the future including:

* The ability to upload a post directly instead of pasting it (including drag and drop, ideally)