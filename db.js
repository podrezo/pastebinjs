'use strict';
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/pastebinjs');
var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

// Schemas
var postSchema = new Schema({
	paste : String
  , title : String
  , language : String
  , expiry: { type: Date, default: null }
  , createdAt: { type: Date, default: Date.now }
  , ip : String
  , hidden: { type: Boolean, default: false }
  , deletepassword: String
});



// Exports
exports.Post = mongoose.model('Post',postSchema);