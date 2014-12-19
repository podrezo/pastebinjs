'use strict';

// Setup routes
angular
  .module('pastebinjsApp').config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {
      $routeProvider
        .when('/', {
          templateUrl: '/views/post.html',
          controller: 'PostController',
          secure: false
        })
        .when('/about', {
          templateUrl: '/views/about.html'
        })
        .when('/p/:postId', {
          templateUrl: '/views/post.html',
          controller: 'PostController'
        })
        .otherwise({
          redirectTo: '/'
        });
      // configure html5 to get links working on jsfiddle
      $locationProvider.html5Mode(true);
      $locationProvider.hashPrefix('!');
    }
  ]);