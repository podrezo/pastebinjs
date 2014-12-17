'use strict';
var pastebinjsApp = angular.module('pastebinjsApp', ['ngRoute','ui.codemirror','angularLoad']);

pastebinjsApp.factory('dataFactory', ['$http', '$q', function ($http, $q) {
    var factory = {};
    factory.getRecentPosts = function() {
        var deferred = $q.defer();
        $http.get('/api/recent')
        .success(function(data, status, headers, config) {
            deferred.resolve(data.posts);
        })
        .error(function(data, status, headers, config) {
            deferred.reject();
        });
        return deferred.promise;
    };
	factory.getConfig = function() {
        var deferred = $q.defer();
        $http.get('/api/config')
        .success(function(data, status, headers, config) {
            deferred.resolve(data);
        })
        .error(function(data, status, headers, config) {
            deferred.reject();
        });
        return deferred.promise;
    };
	factory.getPost = function(postId) {
        var deferred = $q.defer();
        $http.get('/api/post/'+postId)
        .success(function(data, status, headers, config) {
            deferred.resolve(data);
        })
        .error(function(data, status, headers, config) {
            deferred.reject();
        });
        return deferred.promise;
    };
	factory.submitPost = function(postData) {
        var deferred = $q.defer();
        $http({ method: 'POST', url: '/api/post', data: postData })
        .success(function(data, status, headers, config) {
            deferred.resolve(data);
        })
        .error(function(data, status, headers, config) {
            deferred.reject(data);
        });
        return deferred.promise;
    };
	factory.deletePost = function(postId, password) {
        var deferred = $q.defer();
        $http({ method: 'DELETE', url: '/api/post/' + postId, headers: { "Content-Type" : "application/json" }, data: { password: password } })
        .success(function(data, status, headers, config) {
            deferred.resolve();
        })
        .error(function(data, status, headers, config) {
            deferred.reject(data);
        });
        return deferred.promise;
    };
    return factory;
}]);

pastebinjsApp.factory('helperFactory', ['$q', 'angularLoad', function ($q, angularLoad) {
    var factory = {};
    factory.getTimeSince = function(date) {
        var seconds = Math.floor((new Date() - date) / 1000);
		var interval = Math.floor(seconds / 31536000);

		if (interval > 1) {
			return interval + " years";
		}
		interval = Math.floor(seconds / 2592000);
		if (interval > 1) {
			return interval + " months";
		}
		interval = Math.floor(seconds / 86400);
		if (interval > 1) {
			return interval + " days";
		}
		interval = Math.floor(seconds / 3600);
		if (interval > 1) {
			return interval + " hours";
		}
		interval = Math.floor(seconds / 60);
		if (interval > 1) {
			return interval + " minutes";
		}
		return Math.floor(seconds) + " seconds";
    };
	factory.loadLanguageMode = function(languageMode) {
		var deferred = $q.defer();
        angularLoad.loadScript('/static/cmmode/' + languageMode + '/' + languageMode + '.js').then(function() {
			// Script loaded succesfully.
			deferred.resolve();
		}).catch(function() {
			// There was some error loading the script. Meh
			deferred.reject();
		});
		return deferred.promise;
    };
    return factory;
}]);

pastebinjsApp.config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {
      $routeProvider
		.when('/p/:postId', {
			templateUrl: '/static/views/post.html',
			controller: 'PostController'
		})
		.otherwise({
			templateUrl: '/static/views/post.html',
			controller: 'PostController'
		});

      // configure html5 to get links working on jsfiddle
      $locationProvider.html5Mode(true);
  }])
.controller('RecentPostsController', function($scope, $route, $routeParams, $location, $http, dataFactory) {
	$scope.recentPosts = [];
	dataFactory.getRecentPosts()
	.then(function(recentPosts) {
		$scope.recentPosts = recentPosts;
	});
})
.controller('MainController', function($scope, $route, $routeParams, $location, $http, dataFactory) {
	$scope.recentPosts = [];
	dataFactory.getConfig()
	.then(function(configData) {
		$scope.config = configData;
	});	
})
.controller('PostController', function($scope, $route, $routeParams, $location, $http, dataFactory, helperFactory) {
	// all new/updated posts dont expire by default
	$scope.selectedExpiryTime = 0;
	// get the post ID from the URL parameters
	$scope.postId = $routeParams.postId;
	// we are not currently submitting
	$scope.isCurrentlyProcessing = false;
	// get values from querystring
	$scope.deletePassword = $location.search().password;
	$scope.finishedDeletingPost = $location.search().deleted;
	// if a post id is specified, load the post
	if($scope.postId) {
		dataFactory.getPost($scope.postId)
		.then(function(postData) {
			$scope.postData = postData;
			$scope.postedTimeAgo = helperFactory.getTimeSince(new Date(postData.expiry));
			var languageDetails = _.findWhere($scope.config.supportedLanguages,{name:postData.language});
			// set filename for download purposes
			if(languageDetails.ext) {
				$scope.fileName = postData.title + '.' + languageDetails.ext[0];
			} else {
				$scope.fileName = postData.title;
			}
			// codemirror settings
			$scope.editorOptions = {
				lineWrapping : true,
				lineNumbers: true,
				matchBrackets: true,
				readOnly: 'nocursor'
			};
			if(languageDetails) {
				helperFactory.loadLanguageMode(languageDetails.mode)
				.then(function() {
					console.log("Loaded syntax file for mode " + languageDetails.mode);
					// set the language mode for the code editor
					$scope.editorOptions.mode = languageDetails.mode;
				},
				// failed to load syntax highlighting
				function() {
					console.log("Failed to load syntax highlighting file for mode " + languageDetails.mode);
				});
			}
			$scope.newPost = {
				language: postData.language,
				expiry: postData.expiryValue,
				hidden: postData.hidden,
				paste: postData.paste,
				title: postData.title
			};
		});
		// method for deleting a post
		$scope.deletePost = function() {
			$scope.isCurrentlyProcessing = true;
			dataFactory.deletePost($scope.postId,$scope.deletePassword)
			.then(function(postData) {
				$location.$$search = {}; // reset the potential 'deletepassword' query string parameter leftover
				$location.path( "/" ).search('deleted',true);
			},
			function(err) {
				alert('error: '+err);
				$scope.isCurrentlyProcessing = false;
			});
		}
	}
	// set defaults
	else {
		$scope.newPost = {
			language: 'text',
			expiry: 0,
			hidden: false,
			paste: '',
			title: ''
		};
	}
	// method for submitting
	$scope.submitPost = function() {
		$scope.isCurrentlyProcessing = true;
		dataFactory.submitPost($scope.newPost)
		.then(function(postData) {
			$location.path( "/p/" + postData.id ).search('password',postData.deletePassword);
		},
		function(err) {
			alert('error: '+err);
			$scope.isCurrentlyProcessing = false;
		});
	}
});