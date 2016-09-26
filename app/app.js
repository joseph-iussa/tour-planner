'use strict';

angular.module('tourPlanner', [
    'ngRoute'
]).
config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider) {
    $locationProvider.hashPrefix('!');
    $routeProvider.otherwise({ redirectTo: '/' });
}]).
filter('setRadiusModeButtonLabel', function() {
    return function(setRadiusMode) {
        return setRadiusMode ? 'Selecting Radius: Click again to cancel' : 'Select Radius';
    }
}).
controller('TourPlannerController', function TourPlannerController($scope) {
    $scope.radius = 0;
    $scope.setRadiusMode = false;
    $scope.placesOfInterest = [];
    $scope.map = L.map('map').locate({ setView: true });
    $scope.circleOverlay = L.circle([0, 0], 0, {
        weight: 3,
        opacity: 0.4,
        fillOpacity: 0.1
    });
    var BING_API_KEY = 'AvthPFw7d6XY-wifblfxH90wq8DSgIjT2sLkAp2jfDj9hhYMqLcH_Y7MdC-YdBhs';

    L.tileLayer.bing({
        bingMapsKey: BING_API_KEY,
        imagerySet: 'Road'
    }).addTo($scope.map);

    L.Control.geocoder({
        defaultMarkGeocode: false,
        collapsed: false,
        geocoder: new L.Control.Geocoder.Bing(BING_API_KEY)
    })
    .on('markgeocode', function (e) {
        $scope.map.setView(e.geocode.center);
    }).addTo($scope.map);

    $scope.detectLocation = function () {
        $scope.map.locate({ setView: true });
    };

    $scope.toggleSetRadiusMode = function () {
        // Setting mode from ON to OFF.
        if ($scope.setRadiusMode) {
            if ($scope.map.hasLayer($scope.circleOverlay)) {
                $scope.map.removeLayer($scope.circleOverlay);
            }

            $scope.map.removeEventListener('mouseover', initCircleOverlay);
            $scope.map.removeEventListener('mousemove', updateCircleOverlay);
            $scope.map.removeEventListener('mouseout', removeCircleOverlay);

        // Setting mode from OFF to ON.
        } else {
            $scope.map.addEventListener('mouseover', initCircleOverlay);
            $scope.map.addEventListener('mousemove', updateCircleOverlay);
            $scope.map.addEventListener('mouseout', removeCircleOverlay);
            $scope.map.addOneTimeEventListener('click', setRadius);
        }

        $scope.setRadiusMode = !$scope.setRadiusMode;
    }

    function initCircleOverlay(e) {
        // May still have circle overlay if re-selecting radius.
        if (!$scope.map.hasLayer($scope.circleOverlay)) {
            $scope.map.addLayer($scope.circleOverlay);
        }
    }

    function updateCircleOverlay(e) {
        $scope.circleOverlay.setLatLng($scope.map.getCenter());
        $scope.circleOverlay.setRadius(
            $scope.map.getCenter().distanceTo(e.latlng)
        );
    }

    function removeCircleOverlay(e) {
        $scope.map.removeLayer($scope.circleOverlay);
    }

    function setRadius(e) {
        $scope.map.removeEventListener('mouseover', initCircleOverlay);
        $scope.map.removeEventListener('mousemove', updateCircleOverlay);
        $scope.map.removeEventListener('mouseout', removeCircleOverlay);

        $scope.$apply(function () {
            $scope.radius = $scope.map.getCenter().distanceTo(e.latlng);
            $scope.setRadiusMode = false;
        });
    }
});