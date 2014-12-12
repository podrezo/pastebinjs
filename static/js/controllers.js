'use strict';
var pastebinjsApp = angular.module('pastebinjsApp', ['ngRoute']);

pastebinjsApp.config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {
      $routeProvider
        /*.when('/Book/:bookId/ch/:chapterId', {
          templateUrl: 'chapter.html',
          controller: 'ChapterCtrl',
          //controllerAs: 'chapter'
        })
		.when('/SignIn', {
			templateUrl: 'signin.html',
			controller: 'SignInController'
		})
		.when('/Register', {
			templateUrl: 'register.html',
			controller: 'RegisterController'
		})
		.when('/About', {
			templateUrl: 'about.html',
			controller: 'AboutController'
		})*/
		.when('/static/p/:postId', {
			templateUrl: '/static/index.html',
			controller: 'MainController'
		})
		.otherwise({
			templateUrl: '/static/index.html',
			controller: 'MainController'
		});

      // configure html5 to get links working on jsfiddle
      $locationProvider.html5Mode(true);
  }])
.controller('MainController', function($scope, $route, $routeParams, $location) {
	$scope.postId = $routeParams.postId;
	/*$scope.$on('$routeChangeSuccess', function(next, current) {
		alert("Route changed to "+JSON.stringify(current));
	});*/
	$scope.recentPosts = [
        {
            "title": "Test Post",
            "language": "csharp",
            "_id": "548b2cddf59e4ffc12000001"
        }
    ];
	$scope.languages = [
		{ name: 'Shell Script (bash)', alias: 'bash' },
		{ name: 'Erlang', alias: 'erlang' },
		{ name: 'C#', alias: 'cs' },
		{ name: 'Ruby-on-Rails', alias: 'ruby' },
		{ name: 'Diff/Patch', alias: 'diff' },
		{ name: 'javascript', alias: 'javascript' },
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
});