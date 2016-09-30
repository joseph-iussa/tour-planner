'use strict';

angular.module('tourPlanner').
constant('BING_API_KEY', 'AvthPFw7d6XY-wifblfxH90wq8DSgIjT2sLkAp2jfDj9hhYMqLcH_Y7MdC-YdBhs').
constant('BING_API_MIN_RADIUS_METERS', 160).
constant('BING_API_MAX_RADIUS_METERS', 1000000).
config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider) {
    $locationProvider.hashPrefix('!');
    $routeProvider.otherwise({ redirectTo: '/' });
}]);