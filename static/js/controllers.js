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
    }
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
    }
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
    }
    return factory;
}]);

pastebinjsApp.config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {
      $routeProvider
		.when('/static/p/:postId', {
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
	$scope.expiryTimes = [
		{ label: "Never", time: 0 },
		{ label: "5 Minutes", time: 5 },
		{ label: "30 Minutes", time: 30 },
		{ label: "An Hour", time: 60 },
		{ label: "Eight Hours", time: 480 },
		{ label: "A Day", time: 1440 },
		{ label: "Two Weeks", time: 20160 }
	];
	$scope.languages = [
		{ name: 'Shell Script (bash)', alias: 'bash' },
		{ name: 'Erlang', alias: 'erlang' },
		{ name: 'C#', alias: 'cs' },
		{ name: 'Ruby-on-Rails', alias: 'ruby' },
		{ name: 'Diff/Patch', alias: 'diff' },
		{ name: 'JavaScript', alias: 'javascript' },
		{ name: 'LUA', alias: 'lua' },
		{ name: 'XML', alias: 'xml' },
		{ name: 'Markdown', alias: 'markdown' },
		{ name: 'Cascading Style Sheets (CSS)', alias: 'css' },
		{ name: 'LISP', alias: 'lisp' },
		{ name: 'HTTP', alias: 'http' },
		{ name: 'Java', alias: 'java' },
		{ name: 'PHP', alias: 'php' },
		{ name: 'Haskell', alias: 'haskell' },
		{ name: 'Python', alias: 'python' },
		{ name: 'SmallTalk', alias: 'smalltalk' },
		{ name: 'Tex', alias: 'tex' },
		{ name: 'ActionScript', alias: 'actionscript' },
		{ name: 'SQL', alias: 'sql' },
		{ name: 'ini (Configuration File)', alias: 'ini' },
		{ name: 'PERL', alias: 'perl' },
		{ name: 'Scala', alias: 'scala' },
		{ name: 'cmake', alias: 'cmake' },
		{ name: 'Objective C', alias: 'objectivec' },
		{ name: 'VHDL', alias: 'vhdl' },
		{ name: 'CoffeeScript', alias: 'coffeescript' },
		{ name: 'Nginx', alias: 'nginx' },
		{ name: 'R', alias: 'r' },
		{ name: 'JSON', alias: 'json' },
		{ name: 'Django', alias: 'django' },
		{ name: 'Delphi', alias: 'delphi' },
		{ name: 'vbScript', alias: 'vbscript' },
		{ name: 'DOS', alias: 'dos' },
		{ name: 'Apache', alias: 'apache' },
		{ name: 'AppleScript', alias: 'applescript' },
		{ name: 'C++', alias: 'cpp' },
		{ name: 'MatLab', alias: 'matlab' },
		{ name: 'Go', alias: 'go' },
		{ name: 'Plain Text', alias: 'text' }
	];
})
.controller('PostController', function($scope, $route, $routeParams, $location, $http, dataFactory) {
	// all new/updated posts dont expire by default
	$scope.selectedExpiryTime = 0;
	// get the post ID from the URL parameters
	$scope.postId = $routeParams.postId;
	// if a post id is specified, load the post
	if($scope.postId) {
		dataFactory.getPost($scope.postId)
		.then(function(postData) {
			$scope.postData = postData;
		});
	}
	// set defaults
	else {
		$scope.postData = {
			language: 'text',
			expiry: 0,
			hidden: false,
			paste: '',
			title: ''
		}
	}
});