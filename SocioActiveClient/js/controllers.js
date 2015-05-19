function MainCtrl($window, fireFactory, $rootScope) {
 
    this.authData = fireFactory.firebaseRef().getAuth();
    if (this.authData) {
        console.log("User " + this.authData.uid + " is logged in with " + this.authData.provider);
    } else {
        $window.location.href = 'login.html';
    }
    this.userId = this.authData.uid;
    this.email = this.authData.password.email;

    this.currentUserData = fireFactory.getUserObject(this.userId);

    this.currentUserData.$loaded().then(function (loadedData) {
        if (!loadedData.customTypes) {
            loadedData.customTypes = [];
        }
    });

    this.logout = function () {
        fireFactory.firebaseRef().unauth();
        $window.location.href = 'login.html';
    };

    $rootScope.MainCtrlRef = this;

}

function CustomTypesCtrl($state, $scope, contextFactory, $rootScope, fireFactory) {
    $scope.loading = false;
    $scope.getGroupTagContext = contextFactory.getTagContext;
    $scope.addCustomType = function () {
        var customType = {
            name: "New Type",
            data: []
        };

        $rootScope.customTypes.push(customType);

    };
    $scope.updateSelection = function ($event) {
        var checkbox = $event.target;
        $scope.types = (checkbox.checked ? $rootScope.customTypes : $rootScope.primitiveTypes);

    };

    $scope.removeTab = function (customType) {
        var index = $rootScope.customTypes.indexOf(customType);
        $rootScope.customTypes.splice(index, 1);
    };

    $scope.removeUserField = function (userField) {
        var index = $rootScope.createdGroup.fields.indexOf(userField);
        $scope.createdGroup.fields.splice(index, 1);
    };

    $scope.createUserField = function () {
        var userField = {
            name: $scope.userFieldName,
            type: $scope.userFieldType
        };
        if (!$scope.createdGroup.fields) {
            $scope.createdGroup.fields = [];
        }
        $scope.createdGroup.fields.push(userField);
    };

    $scope.addGroupTag = function (tag) {
        if (!$scope.createdGroup.contexts) {
            $scope.createdGroup.contexts = {};
        }
        if(!$scope.createdGroup.contexts[tag.tagContext]){
            $scope.createdGroup.contexts[tag.tagContext] = [];
        }
        $scope.createdGroup.contexts[tag.tagContext].push(tag);
    };

    $scope.saveChanges = function () {

        if ($scope.createdGroup.title == '') {
            alert('Group has no title');
            return;
        }
        if ($scope.createdGroup.description == '') {
            alert('Group has no description');
            return;
        }
        if (isEmpty($scope.createdGroup.fields)) {
            alert('You did not create any fields yet');
            return;
        }

        var strippedGroups = angular.fromJson(angular.toJson($scope.createdGroup));
        var fireBaseObj = fireFactory.getGroupsRef().push(strippedGroups);

        if (!$rootScope.MainCtrlRef.currentUserData.createdGroups) {
            $rootScope.MainCtrlRef.currentUserData.createdGroups = {};
        }
        $rootScope.MainCtrlRef.currentUserData.createdGroups[fireBaseObj.key()] = true;
        if (!$rootScope.MainCtrlRef.currentUserData.contexts) {
            $rootScope.MainCtrlRef.currentUserData.contexts = {};
        }

        angular.forEach($scope.createdGroup.contexts, function(value, key) {
            var contextGroupsRef = fireFactory.getGroupsInContextRef(key);
            var groupLinkObject = {};
            groupLinkObject[fireBaseObj.key()] = value.length;
            contextGroupsRef.update(groupLinkObject);
            if(!$rootScope.MainCtrlRef.currentUserData.contexts[key]){
                $rootScope.MainCtrlRef.currentUserData.contexts[key] = 1;
                return;
            }
            $rootScope.MainCtrlRef.currentUserData.contexts[key]++;
        });

        $scope.loading = true;
        $rootScope.MainCtrlRef.currentUserData.$save().then(function(){
            $scope.loading = false;
            $state.go('activity.groups');

        });


    };

    $scope.userFieldType = '';
    $scope.types = $rootScope.primitiveTypes;
    $scope.userFieldName = '';

    $scope.initPage = function () {
        $rootScope.customTypes = $rootScope.MainCtrlRef.currentUserData.customTypes;
        $scope.createdGroup = {};
        $scope.createdGroup["owner"] = $rootScope.MainCtrlRef.userId;
        $scope.createdGroup["ownerName"] = $rootScope.MainCtrlRef.currentUserData.userName;
        $scope.createdGroup["title"] = '';
        $scope.createdGroup["description"] = '';
        $scope.createdGroup["fields"] = [];

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
                name: $scope.typeParameterName,
                type: $scope.typeParameterType,
                nodes: []
            }
        )
    };
    $scope.typeParameterName = "";
    $scope.typeParameterType = "";
}

function isEmpty(obj) {

    // null and undefined are "empty"
    if (obj == null) return true;

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) return false;
    }

    return true;
}

function NodeInfoCtrl($scope, $rootScope) {


    $scope.updateSelection = function ($event) {
        var checkbox = $event.target;
        $scope.listTypes = (checkbox.checked ? $rootScope.customTypes : $rootScope.primitiveTypes);
    };
    $scope.listTypes = $rootScope.primitiveTypes;
    $scope.newSubItem = function (nodeValue) {

        if (nodeValue.nodeContent == null || nodeValue.nodeContent == '') {
            nodeValue.nodeContent = [];
        }
        nodeValue.nodeContent.push({data: angular.copy(nodeValue.nodeData.data)});
    };
    $scope.removeSubNode = function (item) {

        var index = $scope.nodeValue.nodeContent.indexOf(item);
        $scope.nodeValue.nodeContent.splice(index, 1);
    };
}

function addNodeInfo($compile, $templateCache) {
    return {
        restrict: 'E',
        scope: {
            nodeValue: '=',
            nodeType: '='
        },
        link: function (scope, element) {
            var nodeData = scope.nodeValue;
            var cached_element = $templateCache.get(nodeData.type.name.toLowerCase() + "_" + scope.nodeType + ".html");
            if (cached_element == null || cached_element == '') {
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

function CurrentGroupsCtrl($scope, $state, fireFactory) {
    $scope.hideGroupContent = true;
    $scope.selectedGroupId = null;
    $scope.groups = fireFactory.getGroupsObject();
    $scope.toggle = function (scope) {
        scope.toggle();
    };
    $scope.selectedGroup = null;

    $scope.groups.$watch(function(){
        if($scope.selectedGroupId != null){
            if(!$scope.groups.hasOwnProperty($scope.selectedGroupId)){
                $scope.hideGroupContent = true;
                $scope.selectedGroup = null;
                $scope.selectedGroupId = null;
            }

        }
    });

    $scope.show = function (group,key) {
        $scope.selectedGroup = group;
        $scope.selectedGroupId = key;
        $scope.hideGroupContent = false;
    };
    $scope.getClass = function (group) {
        if(group == $scope.selectedGroup){
            return "list-group-item active";
        }
        return "list-group-item";
    };
    $scope.showContent = function (fieldKey,contentKey) {
        $state.go('create.asd', {groupId: $scope.selectedGroupId, fieldId:fieldKey , contentId: contentKey});
    };

    $scope.addButtonClick = function (selectedTypeId) {
        $state.go('activity.group_add_content', {groupId: $scope.selectedGroupId, typeId: selectedTypeId});
    }
}

function GroupAddCtrl($scope, $state, $rootScope, $window, $stateParams, fireFactory) {
    $scope.loading = false;
    $scope.userField = fireFactory.getFieldObject($stateParams.groupId,$stateParams.typeId);
    $scope.userField.$loaded().then(function(loadedData){
        $scope.customType = angular.copy(loadedData.type);
    });

    $scope.saveChanges = function () {
        if ($scope.userField.content == null) {
            $scope.userField.content = [];
        }
        $scope.userField.content.push({
            ownerId: $rootScope.MainCtrlRef.userId,
            owner: $rootScope.MainCtrlRef.currentUserData.userName,
            data: angular.fromJson(angular.toJson($scope.customType.data))
        });
        $scope.loading = true;
        $scope.userField.$save().then(function(){
            $scope.loading = false;
            $state.go('activity.groups');
        });
    };
}

function GroupViewCtrl($scope, $stateParams, fireFactory) {
    $scope.userField = null;
    $scope.content = fireFactory.getContentObject($stateParams.groupId,$stateParams.fieldId,$stateParams.contentId);
    $scope.content.$loaded().then(function(loadedData){

    })
}

function PictureUploadCtrl($scope,resizeService,$rootScope) {
    $scope.image = null;
    $scope.imageFileName = '';
    $scope.uploadImage = function () {

        $scope.fileReader = new FileReader();
        $scope.fileReader.readAsDataURL(this.$flow.files[0].file);
        $scope.fileReader.onloadend = function () {
            resizeService.resizeImage($scope.fileReader.result, {size: 100, sizeScale: 'ko', otherOptions: '',height:128,width:128}, function(err, image){
                if(err) {
                    console.error(err);
                    return;
                }
                $scope.bigImage = image;
                $rootScope.MainCtrlRef.currentUserData.userImage = $scope.bigImage;
                $rootScope.MainCtrlRef.currentUserData.$save();
            });
            resizeService.resizeImage($scope.fileReader.result, {size: 100, sizeScale: 'ko', otherOptions: '',height:48,width:48}, function(err, image){
                if(err) {
                    console.error(err);
                    return;
                }
                $scope.smallImage = image;
                $rootScope.MainCtrlRef.currentUserData.userImageSmall = $scope.smallImage;
                $rootScope.MainCtrlRef.currentUserData.$save();
            });
        };

    };
}

function SearchCtrl($scope, $firebaseObject, $filter) {
    $scope.searchTerm = '';
    var helperFactory = {};
    helperFactory.firebaseRef = function (path) {
        var baseUrl = "https://resplendent-fire-2746.firebaseio.com";
        path = (path !== '' && path) ? baseUrl + '/' + path : baseUrl;
        return new Firebase(path);
    };
    $scope.pollsFiltered = [];
    $scope.$watch('searchTerm', function () {

        var keepGoing = true;
        $scope.pollsFiltered = [];
        angular.forEach($scope.polls, function(value, key) {
                if(value.hasOwnProperty('pollTags')) {
                    angular.forEach(value.pollTags, function(value2, key2) {
                        if(keepGoing) {
                            if (value2.tagContext.search($scope.searchTerm) > -1) {
                                $scope.pollsFiltered.push(value);
                                keepGoing = false;
                            }
                        }
                    });
                }
                //result[key] = value;
        });

        //$scope.polls =filterFilter($scope.polls, {pollDescription: $scope.searchTerm});
       //console.log($scope.polls);
    });

    $scope.polls = $firebaseObject(helperFactory.firebaseRef().child('data').child('polls'));

    //console.log($scope.polls);
}

function EventCtrl($scope, fireFactory, $stateParams, $firebaseObject) {

    $scope.eventTitle = '';
    $scope.eventDesc = '';
    $scope.eventDate = '';
    $scope.eventLocation = '';



    $scope.events =  $firebaseObject(fireFactory.getEventsRef());
    console.log( $scope.events);


    $scope.saveEventData = function () {
        console.log("Event saved!");
        var eventTitle = $scope.eventTitle.trim();
        var eventDesc = $scope.eventDesc.trim();
        var eventDate = $scope.eventDate;
        var eventLocation = $scope.eventLocation;


        $scope.createdEvent = {};
        $scope.createdEvent["eventTitle"] = eventTitle;
        $scope.createdEvent["eventDesc"] = eventDesc;
        $scope.createdEvent["eventDate"] = eventDate;
        $scope.createdEvent["eventLocation"] = eventLocation;
        $scope.createdEvent["users"] = [];

        var strippedEvents = angular.fromJson(angular.toJson($scope.createdEvent));

        var fireBaseObj = fireFactory.getEventsRef().push(strippedEvents);
        alert("Event is created.");

    }


}

angular
    .module('socioactive')
    .directive('addNodeInfo', addNodeInfo)
    .directive('typeTemplate', typeTemplate)
    .directive('tagTemplate', tagTemplate)
    .controller('MainCtrl', MainCtrl)
    .controller('CustomTypesCtrl', CustomTypesCtrl)
    .controller('TypeTemplateCtrl', TypeTemplateCtrl)
    .controller('NodeInfoCtrl', NodeInfoCtrl)
    .controller('CurrentGroupsCtrl', CurrentGroupsCtrl)
    .controller('GroupAddCtrl', GroupAddCtrl)
    .controller('GroupViewCtrl', GroupViewCtrl)
    .controller('PictureUploadCtrl', PictureUploadCtrl)
	.controller('SearchCtrl', SearchCtrl)
    .controller('EventCtrl', EventCtrl)
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
        $templateCache.put("enumeration_view.html", "<div><input type='text' class='form-control' ng-disabled='true' ng-model='nodeValue.nodeData'></div>");
        $templateCache.put("list.html", '<div class="checkbox"><label> <input icheck type="checkbox" ng-click="updateSelection($event)">Use Custom Types</label></div><select chosen class="chosen-select" style="width:350px;" tabindex="4" ng-model="nodeValue.nodeData" ng-options="s as s.name for s in listTypes"></select>');
        $templateCache.put("list_edit.html", '<a class="pull-right btn btn-white btn-xs" data-nodrag ng-click="newSubItem(nodeValue)"><span class="fa fa-plus"></span></a><div ui-tree id="tree-root"><ol ui-tree-nodes ng-model="nodeValue.nodeContent"><li ng-repeat="subNode in nodeValue.nodeContent" ui-tree-node ng-include="\'list_renderer.html\'"></li></ol></div>');
        $templateCache.put("integer.html", "<div><input type='text' class='form-control' data-mask='99999' ng-model='nodeValue.nodeData'><span class='help-block'>0 to 99999</span></div>");
        $templateCache.put("float.html", "<div><input type='text' class='form-control' data-mask='99999.99999' ng-model='nodeValue.nodeData'><span class='help-block'>0 to 99999.99999</span></div>");
        $templateCache.put("text.html", "<div><input type='text' class='form-control' ng-model='nodeValue.nodeData'></div>");
        $templateCache.put("text_view.html", "<div><input type='text' class='form-control' ng-disabled='true' ng-model='nodeValue.nodeData'></div>");
        $templateCache.put("place.html", "<div>Latitude: {{nodeValue.nodeData.position.D}} Longitude: {{nodeValue.nodeData.position.k}}  Place: {{nodeValue.specialData.place.name}}<button class='btn btn-primary' ng-click='openMap(lg,this)'>Select Place</button></div>");
        $templateCache.put("time.html", "<div class='input-group date'><input type='time' class='form-control' ng-model='nodeValue.nodeData'><span class='input-group-addon'><i class='fa fa-clock-o'></i></span></div>");
        $templateCache.put("time_view.html", "<div class='input-group date'><input type='time' class='form-control' ng-model='nodeValue.nodeData'><span class='input-group-addon'><i class='fa fa-clock-o'></i></span></div>");
        $templateCache.put("date.html", "<div class='input-group date'><input type='date' class='form-control' ng-model='nodeValue.nodeData'><span class='input-group-addon'><i class='fa fa-calendar'></i></span></div>");
        $templateCache.put("date_view.html", "<div class='input-group date'><input type='date' class='form-control' ng-model='nodeValue.nodeData'><span class='input-group-addon'><i class='fa fa-calendar'></i></span></div>");
        $templateCache.put("dateandtime.html", "<div class='input-group date'><input type='datetime' class='form-control' date-time ng-model='nodeValue.nodeData' view='date'><span class='input-group-addon'><i class='fa fa-calendar'></i></span></div>");
        $templateCache.put("dateandtime_view.html", "<div class='input-group date'><input type='datetime' ng-disabled='true' class='form-control' date-time ng-model='nodeValue.nodeData' view='date'><span class='input-group-addon'><i class='fa fa-calendar'></i></span></div>");
        $templateCache.put("phone.html", "<div><input type='text' class='form-control' data-mask='(999) 999-9999' ng-model='nodeValue.nodeData'><span class='help-block'>(999) 999-9999</span></div>");
        $templateCache.put("phone_view.html", "<div><input type='text' class='form-control' data-mask='(999) 999-9999' ng-disabled='true' ng-model='nodeValue.nodeData'><span class='help-block'>(999) 999-9999</span></div>");
        $templateCache.put("currency.html", "<div><input type='text' class='form-control' data-mask='$ 999,999,999.99' ng-model='nodeValue.nodeData'><span class='help-block'>$ 999,999,999.99</span></div>");
        $templateCache.put("currency_view.html", "<div><input type='text' class='form-control' data-mask='$ 999,999,999.99' ng-disabled='true' ng-model='nodeValue.nodeData'><span class='help-block'>$ 999,999,999.99</span></div>");
        $templateCache.put("ipv4.html", "<div><input type='text' class='form-control' data-mask='999.999.999.9999' ng-model='nodeValue.nodeData'><span class='help-block'>192.168.100.200</span></div>");
        $templateCache.put("ipv4_view.html", "<div><input type='text' class='form-control' data-mask='999.999.999.9999' ng-disabled='true' ng-model='nodeValue.nodeData'><span class='help-block'>192.168.100.200</span></div>");
    }])
    .factory('fireFactory', ['$firebaseObject',
        function fireFactory($firebaseObject) {
            var helperFactory = {};
            helperFactory.firebaseRef = function (path) {
                var baseUrl = "https://resplendent-fire-2746.firebaseio.com";
                path = (path !== '' && path) ? baseUrl + '/' + path : baseUrl;
                return new Firebase(path);
            };
            helperFactory.getUserRef = function (uid) {
                return helperFactory.firebaseRef().child('users').child(uid);
            };

            helperFactory.getUserObject = function (uid) {
                return $firebaseObject(helperFactory.getUserRef(uid));
            };

            helperFactory.getData = function () {
                return $firebaseObject(helperFactory.firebaseRef().child('data'));
            };
            helperFactory.loadData = function (callback) {
                var data = helperFactory.getData();
                data.$loaded().then(callback)
            };
            helperFactory.getGroupsObject = function (callback) {
                return $firebaseObject(helperFactory.firebaseRef().child('data').child('groups'));
            };
            helperFactory.getGroupRef = function (uid) {
                return helperFactory.firebaseRef().child('data').child('groups').child(uid);
            };

            helperFactory.getGroupObject = function (uid) {
                return $firebaseObject(helperFactory.getGroupRef(uid));
            };

            helperFactory.getGroupsRef = function () {
                return helperFactory.firebaseRef().child('data').child('groups');
            };
            helperFactory.getGroupsObject = function () {
                return $firebaseObject(helperFactory.getGroupsRef());
            };
            helperFactory.getGroupsInContextRef = function (context) {
                return helperFactory.firebaseRef().child('data').child('contexts').child(context).child('groups');
            };

            helperFactory.getContextsRef = function () {
                return helperFactory.firebaseRef().child('data').child('contexts');
            };

            helperFactory.getContextsObject = function () {
                return $firebaseObject(helperFactory.getContextsRef());
            };

            helperFactory.getFieldObject = function (groupId, fieldId) {
                return $firebaseObject(helperFactory.getGroupsRef().child(groupId).child('fields').child(fieldId));
            };
            helperFactory.getContentObject = function (groupId, fieldId,contentId) {
                return $firebaseObject(helperFactory.getGroupsRef().child(groupId).child('fields').child(fieldId).child('content').child(contentId));
            };
            helperFactory.getEventsRef = function () {
                return helperFactory.firebaseRef().child('data').child('events');
            };
            return helperFactory;


        }]

    )
    .factory('contextFactory', ['$http', '$rootScope',
        function contextFactory($http, $rootScope) {
            var helperFactory = {};
            helperFactory.getTagContext = function (val) {
                var onResult = function (result) {
                    var tagContextRawData = result.data.result;
                    var scores = [];
                    var contexts = [];
                    angular.forEach(tagContextRawData, function (item) {
                        scores.push(item.score);
                    });
                    var scoreTag = helperFactory.calculateAverage(scores) - helperFactory.calculateStandardDeviation(scores) / 2;

                    var tagContextFilteredData = tagContextRawData.filter(function (contextFilter) {
                        if (contextFilter.hasOwnProperty('notable') && contextFilter.notable.name != '') {
                            return (contextFilter.name != '') && (contextFilter.score >= scoreTag);
                        }
                    });

                    angular.forEach(tagContextFilteredData, function (item) {
                        if (item.hasOwnProperty('notable')) {
                            var tagId = guid();
                            console.log(item.notable.name);
                            contexts.push({
                                tagId: tagId,
                                name: item.name + '<p style= "font-style: italic" class="pull-right">' + item.notable.name,
                                tagName: item.name,
                                tagContext: (item.notable.name).split("/").join("-"),
                                tagContextParentDomain: helperFactory.getTagContextParentDomain(item.notable.id),
                                tagContextChildDomain: helperFactory.getTagContextChildDomain(item.notable.id),
                                score: item.score
                            });
                        }
                    });
                    return contexts;
                };

                return $http.get('https://www.googleapis.com/freebase/v1/search', {
                    params: {
                        query: val,
                        key: 'AIzaSyBfJNRIjAao3J0PZeO9ALipSJ_k9NjETwc',
                        limit: 50
                    }
                }).then(onResult);
            };

            helperFactory.calculateStandardDeviation = function(values) {
                var avg = helperFactory.calculateAverage(values);
                var squareDiffs = values.map(function (value) {
                    var diff = value - avg;
                    return diff * diff;
                });
                var avgSquareDiff = calculateAverage(squareDiffs);
                return Math.sqrt(avgSquareDiff);
            };

            helperFactory.calculateAverage = function(data) {
                var sum = data.reduce(function (sum, value) {
                    return sum + value;
                }, 0);

                return sum / data.length;
            };

            helperFactory.getTagContextParentDomain = function(notableId) {
                return notableId.split("/")[1];
            };

            helperFactory.getTagContextChildDomain  = function(notableId) {
                return notableId.split("/")[2];
            };

            return helperFactory;
        }]
    );
