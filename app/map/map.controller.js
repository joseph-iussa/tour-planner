'use strict';

angular.module('map').
controller('MapController', function MapController($scope, BING_API_KEY) {
    $scope.origin = [0, 0];
    $scope.radius = 0;
    $scope.setRadiusMode = false;

    // Map and widget objects.
    $scope.map = L.map('map').locate({ setView: true });
    $scope.originMarker = L.marker([0, 0], { draggable: true });
    $scope.circleOverlay = L.circle([0, 0], 0, {
        weight: 3,
        opacity: 0.4,
        fillOpacity: 0.1
    });

    L.tileLayer.bing({
        bingMapsKey: BING_API_KEY,
        imagerySet: 'Road'
    }).addTo($scope.map);

    // Search widget.
    L.Control.geocoder({
        defaultMarkGeocode: false,
        collapsed: false,
        geocoder: new L.Control.Geocoder.Bing(BING_API_KEY)
    })
    .on('markgeocode', function (e) {
        $scope.map.setView(e.geocode.center);
        updateOrigin(e.geocode.center);
    }).addTo($scope.map);

    // Browser geolocation api.
    $scope.detectLocation = function () {
        $scope.map.locate({ setView: true });
    };

    $scope.map.addEventListener('locationfound', function(e) {
        updateOrigin(e.latlng);
    });

    // Update origin marker based on click.
    $scope.map.addEventListener('click', function(e) {
        // Only if not in set radius mode.
        if (!$scope.setRadiusMode) {
            updateOrigin(e.latlng);
        }
    });

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

    function updateOrigin(latlng) {
        $scope.$apply(function () {
            $scope.origin = latlng;
        });

        $scope.originMarker.setLatLng(latlng).update();

        if (!$scope.map.hasLayer($scope.originMarker)) {
            $scope.map.addLayer($scope.originMarker);
        }

        // If have already drawn radius circle then update circle to follow marker.
        if ($scope.map.hasLayer($scope.circleOverlay)) {
            $scope.circleOverlay.setLatLng($scope.originMarker.getLatLng());
        }
    }

    function initCircleOverlay(e) {
        // May still have circle overlay if re-selecting radius.
        if (!$scope.map.hasLayer($scope.circleOverlay)) {
            $scope.map.addLayer($scope.circleOverlay);
        }
    }

    function updateCircleOverlay(e) {
        $scope.circleOverlay.setLatLng($scope.originMarker.getLatLng());
        $scope.circleOverlay.setRadius(
            $scope.originMarker.getLatLng().distanceTo(e.latlng)
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
            $scope.radius = $scope.originMarker.getLatLng().distanceTo(e.latlng);
            $scope.setRadiusMode = false;
        });
    }
});