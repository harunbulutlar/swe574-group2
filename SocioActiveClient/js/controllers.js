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
    this.userImage = 'img/space_invaders_big.jpg';


    this.logout = function () {
        fireFactory.firebaseRef().unauth();
        $window.location.href = 'login.html';
    };

    $rootScope.MainCtrlRef = this;
    this.currentUserData.$loaded().then(function (loadedData) {
        if (!loadedData.customTypes) {
            loadedData.customTypes = [];
        }
        if(loadedData.userImage){
            $rootScope.MainCtrlRef.userImage = loadedData.userImage;
        }

    });

}

function CustomTypesCtrl($state, $scope, contextFactory, $rootScope, fireFactory) {
    $scope.loading = false;
    $scope.getGroupTagContext = contextFactory.getTagContext;
    $scope.addCustomType = function () {
        var customType = {
            name: "New Type",
            data: []
        };
        if (!$rootScope.MainCtrlRef.currentUserData.customTypes) {
            $rootScope.MainCtrlRef.currentUserData.customTypes = [];
        }
        $rootScope.MainCtrlRef.currentUserData.customTypes.push(customType);

    };
    $scope.updateSelection = function ($event) {
        var checkbox = $event.target;
        $scope.types = (checkbox.checked ? $rootScope.MainCtrlRef.currentUserData.customTypes : $rootScope.primitiveTypes);

    };

    $scope.removeTab = function (customType) {
        var index = $rootScope.MainCtrlRef.currentUserData.customTypes.indexOf(customType);
        $rootScope.MainCtrlRef.currentUserData.customTypes.splice(index, 1);
    };

    $scope.removeUserField = function (userField) {
        var index = $scope.createdGroup.fields.indexOf(userField);
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

        angular.forEach($scope.createdGroup.contexts, function (value, key) {
            var contextGroupsRef = fireFactory.getGroupsInContextRef(key);
            var groupLinkObject = {};
            groupLinkObject[fireBaseObj.key()] = value.length;
            contextGroupsRef.update(groupLinkObject);
            if (!$rootScope.MainCtrlRef.currentUserData.contexts[key]) {
                $rootScope.MainCtrlRef.currentUserData.contexts[key] = 1;
                return;
            }
            $rootScope.MainCtrlRef.currentUserData.contexts[key]++;
        });

        $scope.loading = true;
        $rootScope.MainCtrlRef.currentUserData.$save().then(function () {
            $scope.loading = false;
            $state.go('activity.groups');

        });
    };

    $scope.userFieldType = '';
    $scope.types = $rootScope.primitiveTypes;
    $scope.userFieldName = '';

    $scope.initPage = function () {
        $scope.createdGroup = {};
        $scope.createdGroup["owner"] = $rootScope.MainCtrlRef.userId;
        $scope.createdGroup["ownerName"] = $rootScope.MainCtrlRef.currentUserData.userName;
        $scope.createdGroup["title"] = '';
        $scope.createdGroup["description"] = '';
        $scope.createdGroup["fields"] = [];
        $scope.createdGroup["contexts"] = {};

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

function ItemPreviewCtrl($scope) {

    //$scope.$watch('previewedItem', function () {
    //    if ($scope.selectedItemId != null) {
    //        if (!$scope.previewedItem.hasOwnProperty($scope.selectedItemId)) {
    //            $scope.selectedItem = null;
    //            $scope.selectedItemId = null;
    //        }
    //    }
    //}, true);

    $scope.show = function (item, key) {
        $scope.selectedItem = item;
        $scope.selectedItemId = key;
        $scope.selectedItemType = $scope.getItemType($scope.selectedItem);

    };
    $scope.getItemType = function(item){
        if(item.hasOwnProperty("pollOptions")){
            return "poll";
        } else if(item.hasOwnProperty("eventDate")){
            return "event";
        } else {
            return "group";
        }
    };
    $scope.getClass = function (item) {
        if (item == $scope.selectedItem) {
            return "list-group-item active";
        }
        return "list-group-item";
    };
    $scope.getClass = function (item) {
        if (item == $scope.selectedItem) {
            return "list-group-item active";
        }
        return "list-group-item";
    };
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

function CurrentGroupsCtrl($scope, fireFactory) {
    $scope.groups = fireFactory.getGroupsObject();
}

function GroupTemplateCtrl($rootScope, $scope, contextFactory, $state, fireFactory) {
    var syncObj = fireFactory.getDataTypeObjectById('groups',$scope.selectedItemId);
    syncObj.$bindTo($scope, "selectedItem");
    $scope.toggle = function (scope) {
        scope.toggle();
    };
    $scope.selectedItem = $scope.$parent.ngModel;
    $scope.selectedItemId = $scope.$parent.selectedItemId;

    $scope.addGroupTag = function (tag) {
        if (!$rootScope.MainCtrlRef.currentUserData.interactedGroups) {
            $rootScope.MainCtrlRef.currentUserData.interactedGroups = {};
        }
        var contextGroupsRef = fireFactory.getGroupsInContextRef(tag.tagContext);
        var groupLinkObject = {};
        groupLinkObject[$scope.selectedItemId] = $scope.selectedItem.contexts[tag.tagContext].length;
        contextGroupsRef.update(groupLinkObject);
        if (!$rootScope.MainCtrlRef.currentUserData.contexts[tag.tagContext]) {
            $rootScope.MainCtrlRef.currentUserData.contexts[tag.tagContext] = 1;
        } else {
            $rootScope.MainCtrlRef.currentUserData.contexts[tag.tagContext]++;
        }
        $rootScope.MainCtrlRef.currentUserData.interactedGroups[$scope.selectedItemId] = true;
        $rootScope.MainCtrlRef.currentUserData.$save();

    };

    $scope.showContent = function (fieldKey, contentKey) {
        $state.go('activity.group_add_content', {
            groupId: $scope.selectedItemId,
            fieldId: fieldKey,
            contentId: contentKey
        });
    };

    $scope.addButtonClick = function (selectedTypeId) {
        $state.go('activity.group_add_content', {groupId: $scope.selectedItemId, typeId: selectedTypeId});
    }
}

function GroupAddCtrl($scope, $state, $rootScope, $stateParams, fireFactory) {
    $scope.loading = false;
    $scope.userField = fireFactory.getFieldObject($stateParams.groupId, $stateParams.typeId);
    $scope.userField.$loaded().then(function (loadedData) {
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
        $scope.userField.$save().then(function () {
            if (!$rootScope.MainCtrlRef.currentUserData.interactedGroups) {
                $rootScope.MainCtrlRef.currentUserData.interactedGroups = {};
            }
            $rootScope.MainCtrlRef.currentUserData.interactedGroups[$stateParams.groupId] = true;
            $rootScope.MainCtrlRef.currentUserData.$save().then(function () {
                $scope.loading = false;
                $state.go('activity.groups');

            });
        });

    };
}
function GroupViewCtrl($scope, $stateParams, fireFactory) {
    $scope.userField = null;
    $scope.content = fireFactory.getContentObject($stateParams.groupId, $stateParams.fieldId, $stateParams.contentId);
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

function PictureUploadCtrl($scope, resizeService, $rootScope) {
    $scope.image = null;
    $scope.imageFileName = '';
    $scope.uploadImage = function () {

        $scope.fileReader = new FileReader();
        $scope.fileReader.readAsDataURL(this.$flow.files[0].file);
        $scope.fileReader.onloadend = function () {
            resizeService.resizeImage($scope.fileReader.result, {
                size: 100,
                sizeScale: 'ko',
                otherOptions: '',
                height: 128,
                width: 128
            }, function (err, image) {
                if (err) {
                    console.error(err);
                    return;
                }
                $scope.bigImage = image;
                $rootScope.MainCtrlRef.currentUserData.userImage = $scope.bigImage;
                $rootScope.MainCtrlRef.currentUserData.$save();
            });
            resizeService.resizeImage($scope.fileReader.result, {
                size: 100,
                sizeScale: 'ko',
                otherOptions: '',
                height: 48,
                width: 48
            }, function (err, image) {
                if (err) {
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
        angular.forEach($scope.polls, function (value, key) {
            if (value.hasOwnProperty('pollTags')) {
                angular.forEach(value.pollTags, function (value2, key2) {
                    if (keepGoing) {
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

function TagContextCtrl($scope, contextFactory) {
    $scope.getTagContext = contextFactory.getTagContext;

    $scope.tags = '';
    $scope.manualTags = '';

    $scope.addTag = function(tag){


        if (!$scope.tagContext) {
            $scope.tagContext = {};
        }
        if (!$scope.tagContext[tag.tagContext]) {
            $scope.tagContext[tag.tagContext] = [];
        }
        $scope.tagContext[tag.tagContext].push(tag);

        if($scope.addTagCallback){
            $scope.addTagCallback(tag);
        }
        $scope.tags = '';
        $scope.manualTags = '';
    };

    $scope.addManualTag = function(tags,inputTagContext){

        var context = {};
        var tagId = guid();

        context[tagId] = ({
            tagId: tagId,
            name: tags + '<p style= "font-style: italic" class="pull-right">' + inputTagContext,
            tagName: tags,
            tagContext: inputTagContext,
            tagContextParentDomain: '',
            tagContextChildDomain: '',
            score: ''
        });

        if (!$scope.tagContext[inputTagContext]) {
            $scope.tagContext[inputTagContext] = [];
        }

        $scope.tagContext[inputTagContext].push(context[tagId]);
        if($scope.addManualTagCallback){
            $scope.addManualTagCallback(tags,inputTagContext);
        }

        $scope.tags = '';
        $scope.manualTags = '';
    };

    $scope.removeTag = function(key, tagToBeRemoved){
        var index = arrayObjectIndexOf($scope.tagContext[key], tagToBeRemoved, "tagId");

        $scope.tagContext[key].splice(index, 1);

        if (isObjectEmpty($scope.tagContext[key])) {
            delete $scope.tagContext[key];
        }

        if($scope.removeTagCallback){
            $scope.removeTagCallback(key, id);
        }
    };

    $scope.tagContextList = ["Professional Sports Team",
        "College/University",
        "Place with local areas",
        "Airport",
        "Newspaper",
        "Event"
    ];

}

function EventCtrl($scope, fireFactory,$rootScope, $stateParams, $firebaseObject) {

    $scope.eventTitle = '';
    $scope.eventDesc = '';
    $scope.eventDate = '';
    $scope.eventLocation = '';


    $scope.events = $firebaseObject(fireFactory.getEventsRef());
    console.log($scope.events);


    $scope.saveEventData = function () {
        console.log("Event saved!");
        var eventTitle = $scope.eventTitle.trim();
        var eventDesc = $scope.eventDesc.trim();
        var eventDate = $scope.eventDate;
        var eventLocation = $scope.eventLocation;


        $scope.createdEvent = {};
        $scope.createdEvent["title"] = eventTitle;
        $scope.createdEvent["description"] = eventDesc;
        $scope.createdEvent["ownerName"] = $rootScope.MainCtrlRef.currentUserData.userName;
        $scope.createdEvent["eventDate"] = eventDate;
        $scope.createdEvent["eventLocation"] = eventLocation;
        $scope.createdEvent["users"] = [];

        var strippedEvents = angular.fromJson(angular.toJson($scope.createdEvent));

        var fireBaseObj = fireFactory.getEventsRef().push(strippedEvents);
        alert("Event is created.");

    }

}

function HomeCtrl($scope, $rootScope, fireFactory) {
    $scope.init = function () {
        $rootScope.MainCtrlRef.currentUserData.$loaded().then(function (loadedData) {
            $scope.userContexts = loadedData.contexts;
            $scope.contexts = fireFactory.getContextsObject();
            $scope.contexts.$loaded().then(function () {
                var recommendedPolls = {totalCount: 0 ,array:[]};
                var recommendedGroups = {totalCount: 0 ,array:[]};
                var recommendedEvents = {totalCount: 0 ,array:[]};
                angular.forEach($scope.userContexts, function (value, key) {
                    if (!$scope.contexts[key]) {
                        return;
                    }
                    $scope.findAndCalculate('polls', $scope.contexts[key], loadedData,recommendedPolls,value ,key);
                    $scope.findAndCalculate('groups', $scope.contexts[key], loadedData,recommendedGroups,value ,key);
                    $scope.findAndCalculate('events', $scope.contexts[key], loadedData,recommendedEvents,value ,key);

                });
                $scope.sortByValue(recommendedPolls.array,'count');
                $scope.sortByValue(recommendedGroups.array,'count');
                $scope.sortByValue(recommendedEvents.array,'count');
                $scope.polls = $scope.calculateWeightAndDecide(recommendedPolls,'polls');
                $scope.groups = $scope.calculateWeightAndDecide(recommendedGroups,'groups');
                $scope.events = $scope.calculateWeightAndDecide(recommendedEvents,'events');
            })
        });
    };
    $scope.calculateWeightAndDecide = function(recommendation,type){
        var excessWeight = 0;
        var result = [];
        var staticTotalRecToShow = 5;
        var totalRecToShow = staticTotalRecToShow;
        for(var i =0; i<recommendation.array.length; i++){
            var item = recommendation.array[i];
            var weightOfItem = Math.round((item.count/recommendation.totalCount) * staticTotalRecToShow)+ excessWeight;
            //Since we sorted from top to bottom if weights are equally distributed we can get a zero
            //value. So round it up to 1
            if(weightOfItem == 0){
                weightOfItem = 1;
            }
            if(totalRecToShow < 1){
                break;
            }

            var concatValue = weightOfItem;
            if(totalRecToShow - weightOfItem < 0){
                concatValue = totalRecToShow;
            } else if(item.array.length < weightOfItem){
                excessWeight = excessWeight + (weightOfItem - item.array.length);
                concatValue = item.array.length;
            }

            var skipCount = 0;
            for(var y = 0; y < concatValue ; y++){
                if(!item.array[y] || $scope.hasItem(result,item.array[y].id)){
                    skipCount++;
                } else{
                    result.push({key:item.array[y].id,value:fireFactory.getDataTypeObjectById(type,item.array[y].id)});
                }
            }
            totalRecToShow = totalRecToShow - concatValue + skipCount;
            excessWeight = excessWeight + skipCount;
        }
        return result;

    };
    $scope.hasItem = function(arrayInput, keyInput){
        for(var y = 0; y < arrayInput.length ; y++){
            if(arrayInput[y].key == keyInput){
                return true;
            }
        }
        return false;
    };
    $scope.findAndCalculate = function (itemType, contextItem, userData, outputObject,inputValue,inputKey) {
        var union = [];
        var capitalItemType = capitalizeFirstLetter(itemType);
        angular.forEach(contextItem[itemType], function (value, key) {
            //if (userData['created' + capitalItemType] && userData['created' + capitalItemType][key]) {
            //    return;
            //}
            //if (userData['interacted' + capitalItemType] && userData['interacted' + capitalItemType][key]) {
            //    return;
            //}
            union.push({count:value,id:key});
        });

        $scope.sortByValue(union,'count');
        if(union.length != 0){
            outputObject.totalCount = outputObject.totalCount + inputValue;
            outputObject.array.push({
                count: inputValue,
                name: inputKey,
                array: union
            });
        }
    };
    $scope.sortByValue = function (items,sortProperty) {
        items.sort(function (a, b) {
            if(sortProperty){
                return b[sortProperty] - a[sortProperty]
            } else {
                return b[Object.keys(b)[0]] - a[Object.keys(a)[0]]
            }
        });

    };
    $scope.init();

}
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
angular
    .module('socioactive')
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
    .controller('HomeCtrl', HomeCtrl)
    .controller('ItemPreviewCtrl', ItemPreviewCtrl)
    .controller('GroupTemplateCtrl', GroupTemplateCtrl)
    .controller('TagContextCtrl', TagContextCtrl)
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

            helperFactory.getGroupsInContextObject = function (context) {
                return $firebaseObject(helperFactory.getGroupsRef());
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
            helperFactory.getContentObject = function (groupId, fieldId, contentId) {
                return $firebaseObject(helperFactory.getGroupsRef().child(groupId).child('fields').child(fieldId).child('content').child(contentId));
            };

            helperFactory.getDataTypeObjectById = function (dataType,id) {
                return $firebaseObject(helperFactory.firebaseRef().child('data').child(dataType).child(id));
            };

            helperFactory.getEventsRef = function () {
                return helperFactory.firebaseRef().child('data').child('events');
            };
            return helperFactory;


        }]
)
    .factory('contextFactory', ['$http', '$rootScope',
        function contextFactory($http) {
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

            helperFactory.calculateStandardDeviation = function (values) {
                var avg = helperFactory.calculateAverage(values);
                var squareDiffs = values.map(function (value) {
                    var diff = value - avg;
                    return diff * diff;
                });
                var avgSquareDiff = calculateAverage(squareDiffs);
                return Math.sqrt(avgSquareDiff);
            };

            helperFactory.calculateAverage = function (data) {
                var sum = data.reduce(function (sum, value) {
                    return sum + value;
                }, 0);

                return sum / data.length;
            };

            helperFactory.getTagContextParentDomain = function (notableId) {
                return notableId.split("/")[1];
            };

            helperFactory.getTagContextChildDomain = function (notableId) {
                return notableId.split("/")[2];
            };

            return helperFactory;
        }]
);
