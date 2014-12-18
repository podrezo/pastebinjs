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
		var requestData = {
			language: postData.language,
			expiry: postData.expiry,
			hidden: postData.visibility === 'private',
			paste: postData.paste,
			title: postData.title
		};
        $http({ method: 'POST', url: '/api/post', data: requestData })
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
        $http({ method: 'DELETE', url: '/api/post/' + postId, headers: { 'Content-Type' : 'application/json' }, data: { password: password } })
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
			return interval + ' years';
		}
		interval = Math.floor(seconds / 2592000);
		if (interval > 1) {
			return interval + ' months';
		}
		interval = Math.floor(seconds / 86400);
		if (interval > 1) {
			return interval + ' days';
		}
		interval = Math.floor(seconds / 3600);
		if (interval > 1) {
			return interval + ' hours';
		}
		interval = Math.floor(seconds / 60);
		if (interval > 1) {
			return interval + ' minutes';
		}
		return Math.floor(seconds) + ' seconds';
    };
	factory.loadLanguageMode = function(languageMode) {
		var deferred = $q.defer();
		// do not load null
		if(languageMode === 'null') {
			deferred.resolve();
			return deferred.promise;
		}
		
		var loadScript = function() {
			// load the script
			angularLoad.loadScript('/static/cmmode/' + languageMode + '/' + languageMode + '.js').then(function() {
				// Script loaded succesfully.
				deferred.resolve();
			}).catch(function() {
				// There was some error loading the script. Meh
				deferred.reject();
			});
		};
		
		// if language is htmlmixed, a special case, then we load additional modes first
		if(languageMode === 'htmlmixed') {
			factory.loadLanguageMode('xml')
			.then(factory.loadLanguageMode('javascript'))
			.then(factory.loadLanguageMode('css'))
			.then(loadScript);
		}
		// otherwise just load the script
		else {
			loadScript();
		}
		return deferred.promise;
    };
    return factory;
}]);

pastebinjsApp.config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {
      $routeProvider
		.when('/about', {
			templateUrl: '/static/views/about.html'
		})
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
		recentPosts = _.map(recentPosts,function(post) {
			if(!post.title) {
				post.title = 'Untitled Post';
			}
			return(post);
		});
		$scope.recentPosts = recentPosts;
	});
	// my posts are the client's own recorded posts via HTML5 localStorage
	$scope.myPosts = [];
	if(localStorage)
	{
		var postsString = localStorage.getItem('posts');
		if(postsString) {
			$scope.myPosts = JSON.parse(postsString);
		}
	}
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
	// set up code editor box constants
	$scope.editorOptions = {
		lineWrapping : true,
		lineNumbers: true,
		matchBrackets: true,
		theme: 'neat'
	};
	// if a post id is specified, load the post
	if($scope.postId) {
		$scope.editMode = false;
		$scope.editorOptions.readOnly = 'nocursor';
		dataFactory.getPost($scope.postId)
		.then(function(postData) {
			// set default post title
			if(!postData.title) {
				postData.title = 'Untitled Post';
			}
			$scope.postData = postData;
			$scope.postedTimeAgo = helperFactory.getTimeSince(new Date(postData.expiry));
			var languageDetails = _.findWhere($scope.config.supportedLanguages,{name:postData.language});
			// set filename for download purposes
			if(languageDetails.ext) {
				$scope.fileName = postData.title + '.' + languageDetails.ext[0];
			} else {
				$scope.fileName = postData.title;
			}
			if(languageDetails) {
				helperFactory.loadLanguageMode(languageDetails.mode)
				.then(function() {
					console.log('Loaded syntax file for mode ' + languageDetails.mode);
					// set the language mode for the code editor
					$scope.editorOptions.mode = languageDetails.mode;
				},
				// failed to load syntax highlighting
				function() {
					console.log('Failed to load syntax highlighting file for mode ' + languageDetails.mode);
					$scope.editorOptions.mode = 'null';
				});
			}
			$scope.newPost = {
				language: postData.language,
				expiry: postData.expiryValue,
				visibility: postData.hidden ? 'private' : 'public',
				paste: postData.paste,
				title: postData.title
			};
		});
		// method for deleting a post
		$scope.deletePost = function() {
			$scope.isCurrentlyProcessing = true;
			dataFactory.deletePost($scope.postId,$scope.deletePassword)
			.then(function(postData) {
				// update localStorage if available to save record of this post for the user
				if(localStorage) {
					var myPostsString = localStorage.getItem('posts');
					var myPosts = [];
					if(myPostsString) {
						myPosts = JSON.parse(myPostsString);
					}
					myPosts = _.filter(myPosts,function(post) {
						return post._id !== $scope.postId;
					});
					localStorage.setItem('posts', JSON.stringify(myPosts));
				}
				$location.$$search = {}; // reset any potential previous query string parameters
				$location.path( '/' ).search('deleted',true);
			},
			function(err) {
				alert('error: '+err);
				$scope.isCurrentlyProcessing = false;
			});
		}
	}
	// set defaults
	else {
		$scope.editMode = true;
		$scope.newPost = {
			language: 'Plain Text',
			expiry: 0,
			visibility: 'public',
			paste: '',
			title: ''
		};
	}
	// method for submitting
	$scope.submitPost = function() {
		$scope.isCurrentlyProcessing = true;
		dataFactory.submitPost($scope.newPost)
		.then(function(postData) {
			// update localStorage if available to save record of this post for the user
			if(localStorage) {
				var myPostsString = localStorage.getItem('posts');
				var myPosts = [];
				if(myPostsString) {
					myPosts = JSON.parse(myPostsString);
				}
				myPosts.push({
					_id: postData.id,
					language: $scope.newPost.language,
					title: $scope.newPost.title,
					deletePassword: postData.deletePassword
				});
				localStorage.setItem('posts', JSON.stringify(myPosts));
			}
			// redirect to the post itself
			$location.$$search = {}; // reset any potential previous query string parameters
			$location.path( '/p/' + postData.id ).search('password',postData.deletePassword);
		},
		function(err) {
			alert('error: '+err);
			$scope.isCurrentlyProcessing = false;
		});
	}
	// method for entering edit mode
	$scope.enterEditMode = function() {
		$scope.editMode = true;
		$scope.editorOptions.readOnly = false;
	}
	// method for handling changes to the selected language
	$scope.handleSelectedLanguageChanged = function() {
		var languageDetails = _.findWhere($scope.config.supportedLanguages,{name:$scope.newPost.language});
		helperFactory.loadLanguageMode(languageDetails.mode)
		.then(function() {
			console.log('Loaded syntax file for mode ' + languageDetails.mode);
			// set the language mode for the code editor
			$scope.editorOptions.mode = languageDetails.mode;
		},
		// failed to load syntax highlighting
		function() {
			console.log('Failed to load syntax highlighting file for mode ' + languageDetails.mode);
			$scope.editorOptions.mode = 'null';
		});
	}
});