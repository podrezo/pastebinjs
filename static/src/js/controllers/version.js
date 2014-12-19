'use strict';

angular.module('pastebinjsApp.controllers')
  .controller('VersionController',
    function($scope, $rootScope, $http) {


      $scope.version = '';
      var url = 'https://api.github.com/repos/podrezo/pastebinjs/tags';
      var _fetchVersion = function() {
        return $http({
          method: 'GET',
          url: url
        }).then(function(response) {
          var versionName = response.data[0].name;

          return versionName;
        });
      };

      _fetchVersion().then(function(version) {
        $scope.version = ' ' + version;
      })

    });