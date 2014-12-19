'use strict';


var modules = [
    'ngRoute',
    'ui.codemirror',
    'angularLoad',
    'pastebinjsApp.services',
    'pastebinjsApp.controllers',
    'pastebinjsApp.directives',
    'pastebinjsApp.filters'
];

var pastebinjsApp = window.pastebinjsApp = angular.module('pastebinjsApp', modules);

angular.module('pastebinjsApp.services', []);
angular.module('pastebinjsApp.controllers', []);
angular.module('pastebinjsApp.directives', []);
angular.module('pastebinjsApp.filters', []);