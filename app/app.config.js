'use strict';

angular.module('tourPlanner').
constant('BING_API_KEY', 'AvthPFw7d6XY-wifblfxH90wq8DSgIjT2sLkAp2jfDj9hhYMqLcH_Y7MdC-YdBhs').
config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider) {
    $locationProvider.hashPrefix('!');
    $routeProvider.otherwise({ redirectTo: '/' });
}]);