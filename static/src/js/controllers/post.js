'use strict';

angular.module('pastebinjsApp.controllers')
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
      lineWrapping: true,
      lineNumbers: true,
      matchBrackets: true,
      theme: 'neat'
    };
    // if a post id is specified, load the post
    if ($scope.postId) {
      $scope.editMode = false;
      $scope.editorOptions.readOnly = 'nocursor';
      dataFactory.getPost($scope.postId)
        .then(function(postData) {
          // set default post title
          if (!postData.title) {
            postData.title = 'Untitled Post';
          }
          $scope.postData = postData;
          $scope.postedTimeAgo = helperFactory.getTimeSince(new Date(postData.expiry));
          var languageDetails = _.findWhere($scope.config.supportedLanguages, {
            name: postData.language
          });
          // set filename for download purposes
          if (languageDetails.ext) {
            $scope.fileName = postData.title + '.' + languageDetails.ext[0];
          } else {
            $scope.fileName = postData.title;
          }
          if (languageDetails) {
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
        dataFactory.deletePost($scope.postId, $scope.deletePassword)
          .then(function(postData) {
              // update localStorage if available to save record of this post for the user
              if (localStorage) {
                var myPostsString = localStorage.getItem('posts');
                var myPosts = [];
                if (myPostsString) {
                  myPosts = JSON.parse(myPostsString);
                }
                myPosts = _.filter(myPosts, function(post) {
                  return post._id !== $scope.postId;
                });
                localStorage.setItem('posts', JSON.stringify(myPosts));
              }
              $location.$$search = {}; // reset any potential previous query string parameters
              $location.path('/').search('deleted', true);
            },
            function(err) {
              alert('error: ' + err);
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
            if (localStorage) {
              var myPostsString = localStorage.getItem('posts');
              var myPosts = [];
              if (myPostsString) {
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
            $location.path('/p/' + postData.id).search('password', postData.deletePassword);
          },
          function(err) {
            alert('error: ' + err);
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
      var languageDetails = _.findWhere($scope.config.supportedLanguages, {
        name: $scope.newPost.language
      });
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