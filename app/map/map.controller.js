'use strict';

angular.module('map').
controller('MapController', function MapController(
        $scope, $rootScope, $compile, BING_API_KEY, BING_API_MIN_RADIUS_METERS, BING_API_MAX_RADIUS_METERS) {
    $scope.radius = 0;
    $scope.setRadiusMode = false;

    // Map and widget objects.
    $scope.map = L.map('map').setView([40.7128, -74.0059], 11); // New York.
    $scope.originMarker = L.marker($scope.map.getCenter()).addTo($scope.map);
    $scope.circleOverlay = L.circle([0, 0], 0, {
        weight: 2,
        opacity: 1,
        fillOpacity: 0.05
    });
    $scope.placesOfInterestMarkers = [];

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
            clearEOIMarkers($scope);
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
            $scope.map.removeEventListener('click', setRadius);

        // Setting mode from OFF to ON.
        } else {
            $scope.map.addEventListener('mouseover', initCircleOverlay);
            $scope.map.addEventListener('mousemove', updateCircleOverlay);
            $scope.map.addEventListener('mouseout', removeCircleOverlay);
            $scope.map.addOneTimeEventListener('click', setRadius);
        }

        $scope.setRadiusMode = !$scope.setRadiusMode;
    };

    $scope.removePlaceOfInterest = function(place) {
        $rootScope.$broadcast('placeOfInterestRemoved', place);
    };

    $scope.$on('placesOfInterestUpdated', function(e, placesOfInterest) {
        clearEOIMarkers($scope);

        // Add new markers with popup.
        placesOfInterest.forEach(function(poi) {
            var marker = L.marker([poi.Latitude, poi.Longitude], {
                icon: L.icon({
                    iconUrl: '../img/poi-icon.png',
                    iconSize: L.Icon.Default.prototype.options.iconSize,
                    iconAnchor: L.Icon.Default.prototype.options.iconAnchor,
                    popupAnchor: L.Icon.Default.prototype.options.popupAnchor,
                    shadowUrl: '../img/poi-shadow.png',
                    shadowSize: L.Icon.Default.prototype.options.shadowSize
                }),
                riseOnHover: true
            });

            var poiAndMarkerObj = { poi: poi, marker: marker };

            marker.bindPopup(createPoiPopupContent(poiAndMarkerObj, $scope, $compile));

            $scope.map.addLayer(marker);
            $scope.placesOfInterestMarkers.push(poiAndMarkerObj);
        });
    });

    $scope.$on('placeOfInterestRemoved', function(e, place) {
        var placeMarkerObjIdx = $scope.placesOfInterestMarkers.findIndex(function(poiMarkerObj) { return poiMarkerObj.poi.EntityID === place.EntityID; });
        var placeMarkerObj = $scope.placesOfInterestMarkers[placeMarkerObjIdx];

        placeMarkerObj.marker.closePopup().unbindPopup();
        $scope.map.removeLayer(placeMarkerObj.marker);
        $scope.placesOfInterestMarkers.splice(placeMarkerObjIdx, 1);
    });

    function updateOrigin(latlng) {
        $scope.originMarker.setLatLng(latlng).update();

        // If have already drawn radius circle then remove it and re-set radius.
        if ($scope.map.hasLayer($scope.circleOverlay)) {
            $scope.map.removeLayer($scope.circleOverlay);
            $scope.radius = 0;
            $rootScope.$broadcast('searchAreaCleared');
        }
    }

    function initCircleOverlay(e) {
        // May still have circle overlay if re-selecting radius.
        if (!$scope.map.hasLayer($scope.circleOverlay)) {
            $scope.map.addLayer($scope.circleOverlay);
        }
        $scope.circleOverlay.setLatLng($scope.originMarker.getLatLng());
    }

    function updateCircleOverlay(e) {
        var radius = $scope.originMarker.getLatLng().distanceTo(e.latlng);
        radius = clampWithinBounds(radius, BING_API_MIN_RADIUS_METERS, BING_API_MAX_RADIUS_METERS);

        $scope.circleOverlay.setRadius(radius);
        $scope.$apply(function () {
            $scope.radius = radius;
        });
    }

    function removeCircleOverlay(e) {
        $scope.map.removeLayer($scope.circleOverlay);
    }

    function setRadius(e) {
        $scope.map.removeEventListener('mouseover', initCircleOverlay);
        $scope.map.removeEventListener('mousemove', updateCircleOverlay);
        $scope.map.removeEventListener('mouseout', removeCircleOverlay);

        $scope.$apply(function () {
            var radius = $scope.originMarker.getLatLng().distanceTo(e.latlng);
            $scope.radius = clampWithinBounds(radius, BING_API_MIN_RADIUS_METERS, BING_API_MAX_RADIUS_METERS);
            $scope.setRadiusMode = false;
        });

        $rootScope.$broadcast('searchAreaSet', { origin: $scope.originMarker.getLatLng(), radius: $scope.radius });
    }
});

function clearEOIMarkers($scope) {
    // Remove existing markers.
    $scope.placesOfInterestMarkers.forEach(function (markerObj) {
        $scope.map.removeLayer(markerObj.marker);
    });

    $scope.placesOfInterestMarkers = [];
}

function clampWithinBounds(value, lowerBound, upperBound) {
    value = Math.max(value, lowerBound);
    value = Math.min(value, upperBound);

    return value;
}

function createPoiPopupContent(poiAndMarkerObj, scope, compile) {
    var content = compile(angular.element('<span>{{poi.DisplayName}}<br>'
        + '<a href="" ng-click="removePlaceOfInterest(poi)">'
        + 'Remove</a>'
        + '</span>'));

    var tempScope = scope.$new();
    tempScope.poi = poiAndMarkerObj.poi;

    return content(tempScope)[0];
}