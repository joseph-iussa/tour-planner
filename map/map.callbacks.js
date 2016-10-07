'use strict';

// These callbacks are called with their context object set to $scope, i.e. 'this' refers to $scope.

angular.module('map').
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
service('setRadius', function (updateCircleOverlay, BING_API_MIN_RADIUS_METERS, BING_API_MAX_RADIUS_METERS) {
    return function (e) {
        var eventFromOutsideMap = e instanceof jQuery.Event;
        var ctx, newRadius;

        if (eventFromOutsideMap) {
            ctx = e.data;
            // Get whatever the radius became before mouse left the map.
            newRadius = ctx.circleOverlay.getRadius();
        } else {
            ctx = this;
            newRadius = ctx.originMarker.getLatLng().distanceTo(e.latlng);
        }

        ctx.map.off('mousemove', updateCircleOverlay, ctx);
        ctx.map.off('mouseup', ctx.setRadius, ctx);
        $('body').off('mouseup', ctx.setRadius);

        ctx.map.dragging.enable();

        ctx.$apply(function () {
            ctx.radius = clampWithinBounds(newRadius, BING_API_MIN_RADIUS_METERS, BING_API_MAX_RADIUS_METERS);
            ctx.setRadiusMode = false;
        });

        ctx.$root.$broadcast('searchAreaSet', { origin: ctx.originMarker.getLatLng(), radius: ctx.radius });
    };
});

// Doesn't need injection so can be plain function.
function preventClick(e) {
    e.stopPropagation();
    $('body').get(0).removeEventListener('click', preventClick, true);
}