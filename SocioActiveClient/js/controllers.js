
function MainCtrl() {
    this.userName = 'Harun Bulutlar';
    this.role = "Student"

}

function CustomModalCtrl($scope, $modal) {

    $scope.openMap = function (size,scope) {

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
    $scope.createField = function () {
        $scope.customTypeData.push({
            id: guid(),
            title: $scope.fieldLabel,
            type: $scope.fieldType,
            nodes: []
        });
    };

    $scope.remove = function(scope) {
        scope.remove();
    };
    $scope.toggle = function(scope) {
        scope.toggle();
    };
    $scope.moveLastToTheBeginning = function () {
        var a = $scope.customTypeData.pop();
        $scope.customTypeData.splice(0,0, a);
    };
    $scope.newSubItem = function(scope) {
        scope.$modelValue.nodes.push({
            id: nodeData.id * 10 + nodeData.nodes.length,
            title: nodeData.title + '.' + (nodeData.nodes.length + 1),
            nodes: []
        });
    };
    $scope.isExtensible = function(scope) {
        return scope.$modelValue.type == 'Custom';
    };

    $scope.collapseAll = function() {
        $scope.$broadcast('collapseAll');
    };
    $scope.expandAll = function() {
        $scope.$broadcast('expandAll');
    };
    $scope.saveType = function() {
        var copiedTypeData =[];
        angular.copy($scope.customTypeData, copiedTypeData);
        var customType = {id: guid(), name:$scope.typeLabel, typeData: copiedTypeData};
        $scope.customTypes.push(customType);
        $scope.dispose();
    };

    $scope.typeButtonClick = function(customType) {
        angular.copy(customType.typeData, $scope.customTypeData);
        $scope.typeLabel = customType.name;
        $scope.typeId  = customType.id;
        $scope.showTypeView(true,true);
    };

    $scope.showTypeView = function(show, edit)
    {
        $scope.showTypeDiv = show;
        if(!$scope.showTypeDiv){
            $scope.isEdit = false;
        }
        else{
            $scope.isEdit = edit;
        }

    };

    $scope.removeType = function()
    {
        if(typeof $scope.typeId !='undefined') {

            var index = arrayObjectIndexOf($scope.customTypes,$scope.typeId, 'id');
            $scope.customTypes.splice(index,1);
        }
        $scope.dispose();
    };

    $scope.closeType = function()
    {
        $scope.dispose();
    };
    $scope.dispose = function()
    {
        $scope.customTypeData = [];
        $scope.showTypeView(false);
        $scope.typeLabel = "";
        $scope.typeId = "";
        $scope.fieldType = "";
        $scope.fieldLabel = "";
    };
    $scope.singleType=
    {

    };
    $scope.showTypeDiv = false;
    $scope.customTypeData = [];
    $scope.customTypes = [];
    $scope.primitiveTypes = [
        'Enumeration',
        'Integer',
        'Float',
        'Text',
        'Place',
        'Time',
        'Date',
        'DateAndTime',
        'Phone',
        'Currency',
        'IPV4',
        'Nested'
    ];



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
    for(var i = 0, len = myArray.length; i < len; i++) {
        if (myArray[i][property] === searchTerm) return i;
    }
    return -1;
}
function addNodeInfo($compile,$templateCache) {
    return {
        restrict: 'E',
        scope: { nodeValue: '=' },
        link:  function(scope, element) {
            var nodeData = scope.nodeValue;
            var cached_element = $templateCache.get(nodeData.type.toLowerCase() + ".html");
            var compiled_cache = $compile(cached_element)(scope);
            angular.element(element).append(nodeData.title);
            angular.element(element).append(compiled_cache);
        }
    }

}

function GoogleMaps($scope,$modalInstance) {
    $scope.myMarkers = [];
    $scope.myPlaces = [];

    $scope.mapOptions = {
        zoom: 11,
        center: new google.maps.LatLng(40.6700, -73.9400),
        // Style for Google Maps
        styles: [{"featureType":"water","stylers":[{"saturation":43},{"lightness":-11},{"hue":"#0088ff"}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"hue":"#ff0000"},{"saturation":-100},{"lightness":99}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"color":"#808080"},{"lightness":54}]},{"featureType":"landscape.man_made","elementType":"geometry.fill","stylers":[{"color":"#ece2d9"}]},{"featureType":"poi.park","elementType":"geometry.fill","stylers":[{"color":"#ccdca1"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#767676"}]},{"featureType":"road","elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"}]},{"featureType":"poi","stylers":[{"visibility":"off"}]},{"featureType":"landscape.natural","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#b8cb93"}]},{"featureType":"poi.park","stylers":[{"visibility":"on"}]},{"featureType":"poi.sports_complex","stylers":[{"visibility":"on"}]},{"featureType":"poi.medical","stylers":[{"visibility":"on"}]},{"featureType":"poi.business","stylers":[{"visibility":"simplified"}]}],
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    window.setTimeout(function () {
        google.maps.event.trigger($scope.myMap, 'resize');
    }, 100);

    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = new google.maps.LatLng(position.coords.latitude,
                position.coords.longitude);
            $scope.myMap.setCenter(pos);
        });
    }
    $scope.addMarker= function($event, $params){
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
        if(typeof $scope.service =='undefined')
        {
            $scope.service = new google.maps.places.PlacesService($scope.myMap);
        }

        $scope.service.nearbySearch(request, function(results,status){

            if (status == google.maps.places.PlacesServiceStatus.OK) {

                for (var i = 0; i < results.length; i++) {
                    $scope.myPlaces.push(results[i]);
                }
                $scope.selectedPlace = $scope.myPlaces[0];
                results= [];
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
    .module('inspinia')
    .directive('addNodeInfo', addNodeInfo)
    .controller('MainCtrl', MainCtrl)
    .controller('CustomModalCtrl', CustomModalCtrl)
    .controller('GoogleMaps', GoogleMaps)
    .run(["$templateCache", function($templateCache) {
        $templateCache.put("enumeration.html",    '<div><tags-input ng-model="node.nodeData"></tags-input> <select chosen id="myPlaces" class="form-control" style="width:350px;" tabindex="4" ng-model="selectedPlace" ng-options="s.text for s in node.nodeData"/> </div>');
        $templateCache.put("place.html",    "<div>Latitude: {{node.nodeData.position.D}} Longitude: {{node.nodeData.position.k}}  Place: {{node.specialData.place.name}}<button class='btn btn-primary' ng-click='openMap(lg,this)'>Select Place</button></div>");
        $templateCache.put("time.html",    "<div class='input-group date'><input type='time' class='form-control' ng-model='node.nodeData'><span class='input-group-addon'><i class='fa fa-clock-o'></i></span></div>");
        $templateCache.put("date.html",    "<div class='input-group date'><input type='date' class='form-control' ng-model='node.nodeData'><span class='input-group-addon'><i class='fa fa-calendar'></i></span></div>");
        $templateCache.put("dateandtime.html",    "<div class='input-group date'><input type='datetime' class='form-control' date-time ng-model='node.nodeData' view='date'><span class='input-group-addon'><i class='fa fa-calendar'></i></span></div>");
        $templateCache.put("phone.html",    "<div><input type='text' class='form-control' data-mask='(999) 999-9999' ng-model='node.nodeData'><span class='help-block'>(999) 999-9999</span></div>");
        $templateCache.put("currency.html", "<div><input type='text' class='form-control' data-mask='$ 999,999,999.99' ng-model='node.nodeData'><span class='help-block'>$ 999,999,999.99</span></div>");
        $templateCache.put("ipv4.html", "<div><input type='text' class='form-control' data-mask='999.999.999.9999' ng-model='node.nodeData'><span class='help-block'>192.168.100.200</span></div>");
    }]);
