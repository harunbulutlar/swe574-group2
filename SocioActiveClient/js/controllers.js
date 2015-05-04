function MainCtrl($window) {

    var currentUser = JSON.parse(sessionStorage.getItem('currentUserInfo'));
    if (currentUser == null){
        $window.location.href = 'login.html';
    }
    this.userName = 'Osman Emre';
    this.userId = 1;
    this.isAdmin = false;
    this.role = currentUser.role;
    this.email = currentUser.email;
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
        $rootScope.customTypes.push(customType);
        $scope.customTypeTabs[customType.id] = true;

    };
    $scope.updateSelection = function ($event) {
        var checkbox = $event.target;
        $scope.types = (checkbox.checked ? $rootScope.customTypes : $rootScope.primitiveTypes);

    };
    $scope.removeTab = function (customType) {
        var index = arrayObjectIndexOf($rootScope.customTypes, customType.id, "id");
        delete $scope.customTypeTabs[customType.id];
        $rootScope.customTypes.splice(index, 1);

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
        var createdGroup =
        {
            id: guid(),
            owner:returnObject.currentUser,
            title: $scope.groupTitle,
            description: $scope.groupDescription,
            fields: $scope.userFields,
            content: null

        };
        var groups = JSON.parse(localStorage.getItem('groups'));
        if(groups == null)
        {
            groups = [];
        }
        groups.push(createdGroup);
        localStorage.setItem('groups', JSON.stringify(groups));
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
    $scope.customTypeTabs = {};
    // at the bottom of your controller
    $scope.initPage = function () {
        var returnObject = $scope.getCurrentUserData();
        $rootScope.customTypes = returnObject.currentUser.data.customTypes;
        angular.forEach($rootScope.customTypes, function (event) {
            $scope.customTypeTabs[event.id] = true;
        });
    };
    $scope.initPage();
}

function TypeTemplateCtrl($scope, $rootScope) {

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

function NodeInfoCtrl($scope, $rootScope) {


    $scope.updateSelection = function ($event) {
        var checkbox = $event.target;
        $scope.listTypes = (checkbox.checked ? $rootScope.customTypes : $rootScope.primitiveTypes);
    };
    $scope.listTypes = $rootScope.primitiveTypes;
    $scope.newSubItem = function (nodeValue) {

        if(nodeValue.nodeContent == null || nodeValue.nodeContent == '')
        {
            nodeValue.nodeContent = [];
        }
        nodeValue.nodeContent.push({id:guid(),data:angular.copy(nodeValue.nodeData.data)});
    };
    $scope.removeSubNode = function (item) {

        var index = arrayObjectIndexOf($scope.nodeValue.nodeContent, item.id, "id");
        $scope.nodeValue.nodeContent.splice(index, 1);
    };
}

function addNodeInfo($compile, $templateCache) {
    return {
        restrict: 'E',
        scope: {nodeValue: '=',
                nodeType: '='},
        link: function (scope, element) {
            var nodeData = scope.nodeValue;
            var cached_element = $templateCache.get(nodeData.type.name.toLowerCase()+ "_"+ scope.nodeType + ".html");
            if(cached_element == null || cached_element == '')
            {
                cached_element = $templateCache.get(nodeData.type.name.toLowerCase() + ".html");
            }
            var compiled_cache = $compile(cached_element)(scope);
            angular.element(element).append(nodeData.name);
            angular.element(element).append(compiled_cache);
        },
        controller: NodeInfoCtrl
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

function tagTemplate() {
    return {
        restrict: "E",
        scope: {
            tagParameter: '='
        },
        templateUrl: 'views/tag_template.html'
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
function CurrentGroupsCtrl($scope,$state) {

    $scope.currentGroups = function () {
        if($scope.currentGroupsInternal == '')
        {
            $scope.currentGroupsInternal = JSON.parse(localStorage.getItem('groups'));
        }
        return $scope.currentGroupsInternal;
    };
    $scope.show = function (group) {
        $scope.selectedGroup = group;
    };
    $scope.addContent = function (node) {
    };
    $scope.currentGroupsInternal = '';
    $scope.selectedGroup = '';
    $scope.addButtonClick = function(selectedTypeId){
        $state.go('activity.group_add_content',{groupId:$scope.selectedGroup.id,typeId: selectedTypeId});
    }
}
function GroupAddCtrl($scope, $state, $stateParams) {
    $scope.userFields = null;
    $scope.load = function() {

        var groupId = $stateParams.groupId;
        var typeId = $stateParams.typeId;
        var groups = JSON.parse(localStorage.getItem('groups'));

        for (var i = 0, len = groups.length; i < len; i++) {
            if(groups[i].id == groupId)
            {
                $scope.userFields= groups[i].fields;
                for (var y = 0, lenFields = $scope.userFields.length; y < lenFields; y++) {
                    if($scope.userFields[y].type.id == typeId)
                    {
                        $scope.customType= $scope.userFields[y].type;
                        break;
                    }
                }
            }
        }
    };
    $scope.load();

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

angular
    .module('socioactive')
    .directive('addNodeInfo', addNodeInfo)
    .directive('typeTemplate', typeTemplate)
    .directive('tagTemplate', tagTemplate)
    .controller('MainCtrl', MainCtrl)
    .controller('CustomTypesCtrl', CustomTypesCtrl)
    .controller('GoogleMaps', GoogleMaps)
    .controller('TypeTemplateCtrl', TypeTemplateCtrl)
    .controller('NodeInfoCtrl', NodeInfoCtrl)
    .controller('CurrentGroupsCtrl', CurrentGroupsCtrl)
    .controller('GroupAddCtrl', GroupAddCtrl)
    .run(["$templateCache", "$rootScope", function ($templateCache, $rootScope) {
        $rootScope.primitiveTypes = [
            {name: 'Enumeration'},
            {name: 'List'},
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

        $rootScope.customTypes = [];

        $templateCache.put("enumeration.html", '<div><tags-input ng-model="nodeValue.nodeOptions"></tags-input> <select chosen class="form-control" style="width:350px;" tabindex="4" ng-model="nodeValue.nodeData" ng-options="s.text for s in nodeValue.nodeOptions"/> </div>');
        $templateCache.put("enumeration_edit.html", '<div><select chosen class="form-control" style="width:350px;" tabindex="4" ng-model="nodeValue.nodeData" ng-options="s.text for s in nodeValue.nodeOptions"/> </div>');
        $templateCache.put("list.html", '<div class="checkbox"><label> <input icheck type="checkbox" ng-click="updateSelection($event)">Use Custom Types</label></div><select chosen class="chosen-select" style="width:350px;" tabindex="4" ng-model="nodeValue.nodeData" ng-options="s as s.name for s in listTypes"></select>');
        $templateCache.put("list_edit.html",'<a class="pull-right btn btn-white btn-xs" data-nodrag ng-click="newSubItem(nodeValue)"><span class="fa fa-plus"></span></a><div ui-tree id="tree-root"><ol ui-tree-nodes ng-model="nodeValue.nodeContent"><li ng-repeat="subNode in nodeValue.nodeContent" ui-tree-node ng-include="\'list_renderer.html\'"></li></ol></div>');
        $templateCache.put("integer.html", "<div><input type='text' class='form-control' data-mask='99999' ng-model='nodeValue.nodeData'><span class='help-block'>0 to 99999</span></div>");
        $templateCache.put("float.html", "<div><input type='text' class='form-control' data-mask='99999.99999' ng-model='nodeValue.nodeData'><span class='help-block'>0 to 99999.99999</span></div>");
        $templateCache.put("text.html", "<div><input type='text' class='form-control' ng-model='nodeValue.nodeData'></div>");
        $templateCache.put("place.html", "<div>Latitude: {{nodeValue.nodeData.position.D}} Longitude: {{nodeValue.nodeData.position.k}}  Place: {{nodeValue.specialData.place.name}}<button class='btn btn-primary' ng-click='openMap(lg,this)'>Select Place</button></div>");
        $templateCache.put("time.html", "<div class='input-group date'><input type='time' class='form-control' ng-model='nodeValue.nodeData'><span class='input-group-addon'><i class='fa fa-clock-o'></i></span></div>");
        $templateCache.put("date.html", "<div class='input-group date'><input type='date' class='form-control' ng-model='nodeValue.nodeData'><span class='input-group-addon'><i class='fa fa-calendar'></i></span></div>");
        $templateCache.put("dateandtime.html", "<div class='input-group date'><input type='datetime' class='form-control' date-time ng-model='nodeValue.nodeData' view='date'><span class='input-group-addon'><i class='fa fa-calendar'></i></span></div>");
        $templateCache.put("phone.html", "<div><input type='text' class='form-control' data-mask='(999) 999-9999' ng-model='nodeValue.nodeData'><span class='help-block'>(999) 999-9999</span></div>");
        $templateCache.put("currency.html", "<div><input type='text' class='form-control' data-mask='$ 999,999,999.99' ng-model='nodeValue.nodeData'><span class='help-block'>$ 999,999,999.99</span></div>");
        $templateCache.put("ipv4.html", "<div><input type='text' class='form-control' data-mask='999.999.999.9999' ng-model='nodeValue.nodeData'><span class='help-block'>192.168.100.200</span></div>");
    }]);
