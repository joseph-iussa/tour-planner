'use strict';

angular.module('placesOfInterest').
controller('PlacesOfInterestController', function PlacesOfInterestController($scope, fetchPlaceOfInterestData) {
    $scope.placesOfInterest = [];

    $scope.removePlaceOfInterest = function(place) {
        $scope.$root.$broadcast('placeOfInterestRemoved', place);
    };

    $scope.$on('searchAreaSet', function(e, searchArea) {
        fetchPlaceOfInterestData(
            searchArea.origin.lat, searchArea.origin.lng, searchArea.radius / 1000
        ).done(function (pois) {
            $scope.$apply(function () {
                $scope.placesOfInterest = pois;
            });
            $scope.$root.$broadcast('placesOfInterestUpdated', $scope.placesOfInterest);
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