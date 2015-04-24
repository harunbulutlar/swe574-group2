function MainCtrl() {
    this.userName = 'Osman Emre';
    this.role = "Master"

}

function CustomTypesCtrl($scope, $modal, $rootScope) {

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

    $scope.addCustomType = function () {
        var customType = {
            id: guid(),
            name: "New Type",
            data: []
        };
        $scope.customTypes.push(customType);
        $scope.customTypeTabs[customType.id] = true;

    };
    $scope.updateSelection = function ($event) {
        var checkbox = $event.target;
        $scope.types = (checkbox.checked ? $scope.customTypes : $scope.primitiveTypes);

    };
    $scope.removeTab = function (customType) {
        var index = arrayObjectIndexOf($scope.customTypes, customType.id, "id");
        delete $scope.customTypeTabs[customType.id];
        $scope.customTypes.splice(index, 1);

    };
    $scope.removeUserField = function (userField) {
        var index = arrayObjectIndexOf($scope.userFields, userField.id, "id");
        $scope.userFields.splice(index, 1);
    };
    $scope.createUserField = function () {
        var userField = {
            id: guid(),
            name: $scope.userFieldName,
            type: $scope.userFieldType
        };
        $scope.userFields.push(userField);

    };
    $scope.saveChanges = function () {

        var returnObject = $scope.getCurrentUserData();
        returnObject.currentUser.data.customTypes = $scope.customTypes;
        returnObject.currentUser.data.groups.push(
            {
                title: $scope.groupTitle,
                description: $scope.groupDescription,
                fields: $scope.userFields
            }
        );
        localStorage.setItem('users', JSON.stringify(returnObject.users));
    };

    $scope.getCurrentUserData = function () {
        var user = sessionStorage.getItem('currentUser');
        if (user == null) {
            //TODO: reroute to login page
            return null;
        }
        var users = JSON.parse(localStorage.getItem('users'));
        var userFromDatabase = users[user];
        if (userFromDatabase == null) {
            //TODO: reroute to login page
            return null;
        }
        return {currentUser: userFromDatabase, users: users};
    };

    $scope.userFieldType = '';
    $scope.types = $rootScope.primitiveTypes;
    $scope.groupTitle = '';
    $scope.groupDescription = '';
    $scope.userFields = [];
    $scope.userFieldName = '';
    $scope.customTypes = [];
    $scope.customTypeTabs = {};
    // at the bottom of your controller
    $scope.initPage = function () {
        var returnObject = $scope.getCurrentUserData();
        $scope.customTypes = returnObject.currentUser.data.customTypes;
        angular.forEach($scope.customTypes, function (event) {
            $scope.customTypeTabs[event.id] = true;
        });
    };
    $scope.initPage();
}

function TypeTemplateCtrl($scope) {

    $scope.remove = function (scope) {
        scope.remove();
    };
    $scope.toggle = function (scope) {
        scope.toggle();
    };
    $scope.moveLastToTheBeginning = function () {
        var a = $scope.typeParameter.data.pop();
        $scope.typeParameter.data.splice(0, 0, a);
    };
    $scope.collapseAll = function () {
        $scope.$broadcast('collapseAll');
    };
    $scope.expandAll = function () {
        $scope.$broadcast('expandAll');
    };
    $scope.createField = function () {
        $scope.typeParameter.data.push(
            {
                id: guid(),
                name: $scope.typeParameterName,
                type: $scope.typeParameterType,
                nodes: []
            }
        )
    };
    $scope.typeParameterName = "";
    $scope.typeParameterType = "";
}


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

function addNodeInfo($compile, $templateCache) {
    return {
        restrict: 'E',
        scope: {nodeValue: '='},
        link: function (scope, element) {
            var nodeData = scope.nodeValue;
            var cached_element = $templateCache.get(nodeData.type.name.toLowerCase() + ".html");
            var compiled_cache = $compile(cached_element)(scope);
            angular.element(element).append(nodeData.name);
            angular.element(element).append(compiled_cache);
        }
    }
}

function typeTemplate() {
    return {
        restrict: "E",
        scope: {
            typeParameter: '='
        },
        templateUrl: 'views/type_template.html'
    };
}

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

function arrayObjectIndexOf(myArray, searchTerm, property) {
    for (var i = 0, len = myArray.length; i < len; i++) {
        if (myArray[i][property] === searchTerm) return i;
    }
    return -1;
}


angular
    .module('socioactive')
    .directive('addNodeInfo', addNodeInfo)
    .directive('typeTemplate', typeTemplate)
    .controller('MainCtrl', MainCtrl)
    .controller('CustomTypesCtrl', CustomTypesCtrl)
    .controller('GoogleMaps', GoogleMaps)
    .controller('TypeTemplateCtrl', TypeTemplateCtrl)
    .run(["$templateCache", "$rootScope", function ($templateCache, $rootScope) {
        $rootScope.primitiveTypes = [
            {name: 'Enumeration'},
            {name: 'Integer'},
            {name: 'Float'},
            {name: 'Text'},
            {name: 'Place'},
            {name: 'Time'},
            {name: 'Date'},
            {name: 'DateAndTime'},
            {name: 'Phone'},
            {name: 'Currency'},
            {name: 'IPV4'}
        ];
        $templateCache.put("enumeration.html", '<div><tags-input ng-model="node.nodeData"></tags-input> <select chosen id="myPlaces" class="form-control" style="width:350px;" tabindex="4" ng-model="selectedPlace" ng-options="s.text for s in node.nodeData"/> </div>');
        $templateCache.put("integer.html", "<div><input type='text' class='form-control' data-mask='99999' ng-model='node.nodeData'><span class='help-block'>0 to 99999</span></div>");
        $templateCache.put("float.html", "<div><input type='text' class='form-control' data-mask='99999.99999' ng-model='node.nodeData'><span class='help-block'>0 to 99999.99999</span></div>");
        $templateCache.put("text.html", "<div><input type='text' class='form-control'></div>");
        $templateCache.put("place.html", "<div>Latitude: {{node.nodeData.position.D}} Longitude: {{node.nodeData.position.k}}  Place: {{node.specialData.place.name}}<button class='btn btn-primary' ng-click='openMap(lg,this)'>Select Place</button></div>");
        $templateCache.put("time.html", "<div class='input-group date'><input type='time' class='form-control' ng-model='node.nodeData'><span class='input-group-addon'><i class='fa fa-clock-o'></i></span></div>");
        $templateCache.put("date.html", "<div class='input-group date'><input type='date' class='form-control' ng-model='node.nodeData'><span class='input-group-addon'><i class='fa fa-calendar'></i></span></div>");
        $templateCache.put("dateandtime.html", "<div class='input-group date'><input type='datetime' class='form-control' date-time ng-model='node.nodeData' view='date'><span class='input-group-addon'><i class='fa fa-calendar'></i></span></div>");
        $templateCache.put("phone.html", "<div><input type='text' class='form-control' data-mask='(999) 999-9999' ng-model='node.nodeData'><span class='help-block'>(999) 999-9999</span></div>");
        $templateCache.put("currency.html", "<div><input type='text' class='form-control' data-mask='$ 999,999,999.99' ng-model='node.nodeData'><span class='help-block'>$ 999,999,999.99</span></div>");
        $templateCache.put("ipv4.html", "<div><input type='text' class='form-control' data-mask='999.999.999.9999' ng-model='node.nodeData'><span class='help-block'>192.168.100.200</span></div>");
    }]);
