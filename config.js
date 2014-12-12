module.exports = {
	"listenport" : 8000,
	"checkReferer" : false,
	"refererRegex" : /^http(s)?:\/\/(www\.)?yourdomain.com.*/i,
	"maxRecentPosts" : 10,
	"postRestrictions" : {
		"titleLength": 50,
		"pasteLength" : 524288
	}
}