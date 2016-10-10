'use strict';

angular.module('placesOfInterest').
service('fetchPlaceOfInterestData', function ($q, BING_API_KEY) {
    return function(lat, lng, radius) {
        var url = 'https://spatial.virtualearth.net/REST/v1/data/f22876ec257b474b82fe2ffcb8393150/NavteqNA/NavteqPOIs';
        var params = {
            'spatialFilter': 'nearby(' + lat + ',' + lng + ',' + radius + ')',
            '$top': 50,
            '$format': 'json',
            'key': BING_API_KEY
        };

        return $q(function (resolve, reject) {
            // Using jQuery here because couldn't get Angular's $http.jsonp nor $resource to work with bing's API.
            $.ajax({
                url: url,
                jsonp: "jsonp",
                dataType: "jsonp",
                data: params,
            }).done(function (response) {
                resolve(response.d.results);
            }).fail(function (jqXHR, textStatus, errorThrown) {
                reject(textStatus);
            });
        });
    };
});