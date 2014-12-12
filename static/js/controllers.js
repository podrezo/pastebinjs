var pastebinjsApp = angular.module('pastebinjsApp', []);

pastebinjsApp.controller('RecentPostsController', function ($scope) {
  $scope.recentPosts = [
        {
            "title": "Test Post",
            "language": "csharp",
            "_id": "548b2cddf59e4ffc12000001"
        }
    ];
});