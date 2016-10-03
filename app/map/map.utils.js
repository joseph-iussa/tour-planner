function clearEOIMarkers(scope) {
    // Remove existing markers.
    scope.placesOfInterestMarkers.forEach(function (markerObj) {
        scope.map.removeLayer(markerObj.marker);
    });

    scope.placesOfInterestMarkers = [];
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

function updateOrigin(latlng, scope) {
    scope.originMarker.setLatLng(latlng).update();

    // If have already drawn radius circle then remove it and re-set radius.
    if (scope.map.hasLayer(scope.circleOverlay)) {
        scope.map.removeLayer(scope.circleOverlay);
        scope.radius = 0;
        scope.$root.$broadcast('searchAreaCleared');
    }
}