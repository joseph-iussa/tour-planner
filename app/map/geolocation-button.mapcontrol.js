L.Control.GeolocationButton = L.Control.extend({
    options: {
        position: 'topright'
    },

    onAdd: function(map) {
        return $('<div class="leaflet-control leaflet-bar geolocationButton"></div>').
            append($('<a href="">Set Location Using Device</a>').
                attr('title', 'Attempt to set initial search location using your device\'s location.').
                on('click', function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    map.locate({ setView: true });
                })
            ).get(0);
    }
});

L.control.geolocationButton = function (options) {
    return new L.Control.GeolocationButton(options);
};