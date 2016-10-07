'use strict';

angular.module('map').
filter('setRadiusModeButtonLabel', function() {
    return function(setRadiusMode) {
        return setRadiusMode ? 'Selecting Radius: Click again to cancel' : 'Select Radius';
    }
});