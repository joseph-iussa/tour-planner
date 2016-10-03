'use strict';

angular.module('placesOfInterest').
controller('PlacesOfInterestController', function PlacesOfInterestController($scope, BING_API_KEY) {
    $scope.placesOfInterest = [];

    $scope.removePlaceOfInterest = function(place) {
        $scope.$root.$broadcast('placeOfInterestRemoved', place);
    };

    $scope.$on('searchAreaSet', function(e, searchArea) {
        var lat = searchArea.origin.lat;
        var lng = searchArea.origin.lng;
        var radiusKms = searchArea.radius / 1000;
        var url = 'http://spatial.virtualearth.net/REST/v1/data/f22876ec257b474b82fe2ffcb8393150/NavteqNA/NavteqPOIs';
        var params = {
            'spatialFilter': 'nearby(' + lat + ',' + lng + ',' + radiusKms + ')',
            '$top': 50,
            '$format': 'json',
            'key': BING_API_KEY
        };

        // Using jQuery here because couldn't get Angular's $http.jsonp to work with bing's API.
        $.ajax({
            url: url,
            jsonp: "jsonp",
            dataType: "jsonp",
            data: params,

            success: function (response) {
                var pois = response.d.results;
                $scope.$apply(function () {
                    $scope.placesOfInterest = pois;
                });
                $scope.$root.$broadcast('placesOfInterestUpdated', pois);
            }
        });

    });

    $scope.$on('searchAreaCleared', function () {
        $scope.$apply(function () {
            $scope.placesOfInterest = [];
        });
        $scope.$root.$broadcast('placesOfInterestUpdated', $scope.placesOfInterest);
    });

    $scope.$on('placeOfInterestRemoved', function(e, place) {
        $scope.placesOfInterest.splice($scope.placesOfInterest.indexOf(place), 1);
    });
});