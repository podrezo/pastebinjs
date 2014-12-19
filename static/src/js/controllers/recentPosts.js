'use strict';

angular.module('pastebinjsApp.controllers')
  .controller('MainController', function($scope, $route, $routeParams, $location, $http, dataFactory) {
    $scope.recentPosts = [];
    dataFactory.getConfig()
      .then(function(configData) {
        $scope.config = configData;
      });
  });