'use strict';

angular.module('map').
controller('MapController', function MapController($scope, $compile, BING_API_KEY,
        updateCircleOverlay, setRadius) {
    $scope.radius = 0;
    $scope.setRadiusMode = false;
    $scope.placesOfInterestMarkers = [];

    // Cache this so can refer to it in itself without creating a circular dependency.
    $scope.setRadius = setRadius;

    // Map and widget objects.
    $scope.map = L.map('map').setView([40.7128, -74.0059], 11); // New York.

    $scope.originMarker = L.marker($scope.map.getCenter()).addTo($scope.map);
    $scope.originMarker.on('mousedown', function(e) {
        // Stop Leaflet from trying to drag the marker.
        L.DomEvent.stop(e.originalEvent);

        // Bail out if already dragging, i.e. user has started dragging but is still
        // over the marker.
        if ($scope.setRadiusMode) return;

        $scope.map.dragging.disable();
        $scope.setRadiusMode = true;

        // May still have circle overlay if re-selecting radius.
        if (!$scope.map.hasLayer($scope.circleOverlay)) {
            $scope.map.addLayer($scope.circleOverlay);
        }
        $scope.circleOverlay.setLatLng($scope.originMarker.getLatLng());

        $scope.map.on('mousemove', updateCircleOverlay, $scope);
        $scope.map.on('mouseup', setRadius, $scope);
        // In case user drags outside of map area and then releases mouse.
        $('body').on('mouseup', $scope, setRadius);

        // Stop click events during and at end of dragging.
        // Firefox doesn't seem to fire the click event.
        if (!L.Browser.gecko) {
            $('body').get(0).addEventListener('click', preventClick, true);
        }
    });

    $scope.circleOverlay = L.circle([0, 0], 0, {
        weight: 2,
        opacity: 1,
        fillOpacity: 0.05
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
        updateOrigin(e.geocode.center, $scope);
    }).addTo($scope.map);

    // Browser geolocation api.
    L.control.geolocationButton().addTo($scope.map);

    $scope.map.on('locationfound', function(e) {
        updateOrigin(e.latlng, $scope);
    });

    // Update origin marker based on click.
    $scope.map.on('click', function(e) {
        // Only if not in set radius mode.
        if (!$scope.setRadiusMode) {
            updateOrigin(e.latlng, $scope);
            clearEOIMarkers($scope);
        }
    });

    $scope.removePlaceOfInterest = function(place) {
        $scope.$root.$broadcast('placeOfInterestRemoved', place);
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
});