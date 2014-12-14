'use strict';
var pastebinjsApp = angular.module('pastebinjsApp', ['ngRoute']);

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
.controller('PostController', function($scope, $route, $routeParams, $location, $http, dataFactory) {
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