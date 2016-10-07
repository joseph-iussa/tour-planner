'use strict';

angular.module('placesOfInterest').
service('fetchPlaceOfInterestData', function (BING_API_KEY) {
    return function(lat, lng, radius) {
        var url = 'http://spatial.virtualearth.net/REST/v1/data/f22876ec257b474b82fe2ffcb8393150/NavteqNA/NavteqPOIs';
        var params = {
            'spatialFilter': 'nearby(' + lat + ',' + lng + ',' + radius + ')',
            '$top': 50,
            '$format': 'json',
            'key': BING_API_KEY
        };

        // Using jQuery here because couldn't get Angular's $http.jsonp to work with bing's API.
        var deferred = $.Deferred();

        $.ajax({
            url: url,
            jsonp: "jsonp",
            dataType: "jsonp",
            data: params,
        }).done(function (response, textStatus, jqXHR) {
            deferred.resolve(response.d.results);
        });

        return deferred;
    };
});