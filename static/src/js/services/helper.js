'use strict';

angular.module('pastebinjsApp.services').factory('helperFactory', ['$q', 'angularLoad',
  function($q, angularLoad) {
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
      if (languageMode === 'null') {
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
      if (languageMode === 'htmlmixed') {
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
  }
]);