'use strict';

angular.module('placesOfInterest').
controller('PlacesOfInterestController', function PlacesOfInterestController($scope, fetchPlaceOfInterestData) {
    $scope.placesOfInterest = [];
    $scope.poiDataFetchError = false;

    $scope.removePlaceOfInterest = function(place) {
        $scope.$root.$broadcast('placeOfInterestRemoved', place);
    };

    $scope.$on('searchAreaSet', function(e, searchArea) {
        fetchPlaceOfInterestData(
            searchArea.origin.lat, searchArea.origin.lng, searchArea.radius / 1000
        ).then(function (pois) {
            $scope.placesOfInterest = pois;
            $scope.poiDataFetchError = false;
        }, function (error) {
            $scope.placesOfInterest = [];
            $scope.poiDataFetchError = true;
        }).finally(function () {
            $scope.$root.$broadcast('placesOfInterestUpdated', $scope.placesOfInterest);
        });
    });

    $scope.$on('searchAreaCleared', function () {
        $scope.$apply(function () {
            $scope.placesOfInterest = [];
        });
        $scope.$root.$broadcast('placesOfInterestUpdated', $scope.placesOfInterest);
    });

    $scope.$on('placeOfInterestRemoved', function (e, place) {
        var idx = $scope.placesOfInterest.indexOf(place);
        if (idx === -1) {
            return;
        }
        $scope.placesOfInterest.splice(idx, 1);
    });
});