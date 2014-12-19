'use strict';

angular.module('pastebinjsApp.services').factory('dataFactory', ['$http', '$q',
  function($http, $q) {
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
      $http.get('/api/post/' + postId)
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
      $http({
        method: 'POST',
        url: '/api/post',
        data: requestData
      })
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
      $http({
        method: 'DELETE',
        url: '/api/post/' + postId,
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          password: password
        }
      })
        .success(function(data, status, headers, config) {
          deferred.resolve();
        })
        .error(function(data, status, headers, config) {
          deferred.reject(data);
        });
      return deferred.promise;
    };
    return factory;
  }
]);