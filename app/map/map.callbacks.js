'use strict';

// These callbacks are called with their context object set to $scope, i.e. 'this' refers to $scope.

angular.module('map').
service('initCircleOverlay', function () {
    return function (e) {
        // May still have circle overlay if re-selecting radius.
        if (!this.map.hasLayer(this.circleOverlay)) {
            this.map.addLayer(this.circleOverlay);
        }
        this.circleOverlay.setLatLng(this.originMarker.getLatLng());
    };
}).
service('updateCircleOverlay', function (BING_API_MIN_RADIUS_METERS, BING_API_MAX_RADIUS_METERS) {
    return function (e) {
        var radius = this.originMarker.getLatLng().distanceTo(e.latlng);
        radius = clampWithinBounds(radius, BING_API_MIN_RADIUS_METERS, BING_API_MAX_RADIUS_METERS);

        this.circleOverlay.setRadius(radius);

        var that = this;
        this.$apply(function () {
            that.radius = radius;
        });
    };
}).
service('removeCircleOverlay', function () {
    return function (e) {
        this.map.removeLayer(this.circleOverlay);
    };
}).
service('setRadius', function (initCircleOverlay, updateCircleOverlay, removeCircleOverlay,
        BING_API_MIN_RADIUS_METERS, BING_API_MAX_RADIUS_METERS) {
    return function (e) {
        this.map.off('mouseover', initCircleOverlay, this);
        this.map.off('mousemove', updateCircleOverlay, this);
        this.map.off('mouseout', removeCircleOverlay, this);

        var that = this;
        this.$apply(function () {
            var radius = that.originMarker.getLatLng().distanceTo(e.latlng);
            that.radius = clampWithinBounds(radius, BING_API_MIN_RADIUS_METERS, BING_API_MAX_RADIUS_METERS);
            that.setRadiusMode = false;
        });

        this.$root.$broadcast('searchAreaSet', { origin: this.originMarker.getLatLng(), radius: this.radius });
    };
});