'use strict';

angular.module('pastebinjsApp.controllers')
  .controller('RecentPostsController', function($scope, $route, $routeParams, $location, $http, dataFactory) {
    $scope.recentPosts = [];
    dataFactory.getRecentPosts()
      .then(function(recentPosts) {
        recentPosts = _.map(recentPosts, function(post) {
          if (!post.title) {
            post.title = 'Untitled Post';
          }
          return (post);
        });
        $scope.recentPosts = recentPosts;
      });
    // my posts are the client's own recorded posts via HTML5 localStorage
    $scope.myPosts = [];
    if (localStorage) {
      var postsString = localStorage.getItem('posts');
      if (postsString) {
        $scope.myPosts = JSON.parse(postsString);
      }
    }
  });