/**
 * Created by Harun on 5/9/2015.
 */
$scope.openMap = function (size, scope) {

    var modalInstance = $modal.open({
        templateUrl: 'views/place_modal.html',
        controller: GoogleMaps,
        size: size,
        resolve: {
            loadPlugin: function ($ocLazyLoad) {
                return $ocLazyLoad.load([
                    {
                        name: 'ui.event',
                        files: ['js/plugins/uievents/event.js']
                    },
                    {
                        name: 'ui.map',
                        files: ['js/plugins/uimaps/ui-map.js']
                    }
                ]);
            }
        }
    });
    modalInstance.result.then(function (locationData) {
        scope.$modelValue.nodeData = locationData;
    });
};

function GoogleMaps($scope, $modalInstance) {
    $scope.myMarkers = [];
    $scope.myPlaces = [];

    $scope.mapOptions = {
        zoom: 11,
        center: new google.maps.LatLng(40.6700, -73.9400),
        // Style for Google Maps
        styles: [{
            "featureType": "water",
            "stylers": [{"saturation": 43}, {"lightness": -11}, {"hue": "#0088ff"}]
        }, {
            "featureType": "road",
            "elementType": "geometry.fill",
            "stylers": [{"hue": "#ff0000"}, {"saturation": -100}, {"lightness": 99}]
        }, {
            "featureType": "road",
            "elementType": "geometry.stroke",
            "stylers": [{"color": "#808080"}, {"lightness": 54}]
        }, {
            "featureType": "landscape.man_made",
            "elementType": "geometry.fill",
            "stylers": [{"color": "#ece2d9"}]
        }, {
            "featureType": "poi.park",
            "elementType": "geometry.fill",
            "stylers": [{"color": "#ccdca1"}]
        }, {
            "featureType": "road",
            "elementType": "labels.text.fill",
            "stylers": [{"color": "#767676"}]
        }, {
            "featureType": "road",
            "elementType": "labels.text.stroke",
            "stylers": [{"color": "#ffffff"}]
        }, {"featureType": "poi", "stylers": [{"visibility": "off"}]}, {
            "featureType": "landscape.natural",
            "elementType": "geometry.fill",
            "stylers": [{"visibility": "on"}, {"color": "#b8cb93"}]
        }, {"featureType": "poi.park", "stylers": [{"visibility": "on"}]}, {
            "featureType": "poi.sports_complex",
            "stylers": [{"visibility": "on"}]
        }, {"featureType": "poi.medical", "stylers": [{"visibility": "on"}]}, {
            "featureType": "poi.business",
            "stylers": [{"visibility": "simplified"}]
        }],
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    window.setTimeout(function () {
        google.maps.event.trigger($scope.myMap, 'resize');
    }, 100);

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var pos = new google.maps.LatLng(position.coords.latitude,
                position.coords.longitude);
            $scope.myMap.setCenter(pos);
        });
    }
    $scope.addMarker = function ($event, $params) {
        for (var i = 0; i < $scope.myMarkers.length; i++) {
            $scope.myMarkers[i].setMap(null);
        }
        $scope.myMarkers = [];
        $scope.myMarkers.push(new google.maps.Marker({
            map: $scope.myMap,
            position: $params[0].latLng
        }));
        var request = {
            location: $scope.myMarkers[0].position,
            radius: '50'
        };
        $scope.myPlaces = [];
        if (typeof $scope.service == 'undefined') {
            $scope.service = new google.maps.places.PlacesService($scope.myMap);
        }

        $scope.service.nearbySearch(request, function (results, status) {

            if (status == google.maps.places.PlacesServiceStatus.OK) {

                for (var i = 0; i < results.length; i++) {
                    $scope.myPlaces.push(results[i]);
                }
                $scope.selectedPlace = $scope.myPlaces[0];
                results = [];
            }
        });
    };
    $scope.selectPlace = function () {
        if (typeof $scope.myMarkers !== 'undefined' && $scope.myMarkers.length > 0) {

            var locationData = {
                position: $scope.myMarkers[0].position,
                place: $scope.selectedPlace
            };
            $modalInstance.close(locationData);
        }

    };
}