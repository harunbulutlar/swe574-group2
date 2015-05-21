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

        angular.forEach($rootScope.MainCtrlRef.currentUserData.contexts, function (value, key) {
            var userInContext= fireFactory.getUserInContextRef(key,$rootScope.MainCtrlRef.userId);
            userInContext.set(value);
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

function ItemPreviewCtrl($scope,fireFactory) {

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
        var itemClass = "list-group-item";
        if (item == $scope.selectedItem) {
            itemClass = "list-group-item active";
        }

        var userId = null;
        if(item.hasOwnProperty('createdBy')){
            userId = item.createdBy;

        } else if (item.hasOwnProperty('owner')){
            userId = item.owner;
        }

        if(!item.imageLoaded)
        {
            item.image = "img/space_invaders_small.jpg";
            if(userId){
                var image = fireFactory.getUserImageSmallObject(userId);
                image.$loaded().then(function(loadedData){
                    if(loadedData.$value){
                        item.image = loadedData.$value;
                    }
                })
            }
            item.imageLoaded = true;
        }

       return itemClass;
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

        var userInContext= fireFactory.getUserInContextRef(tag.tagContext,$rootScope.MainCtrlRef.userId);
        userInContext.set($rootScope.MainCtrlRef.currentUserData.contexts[tag.tagContext]);

        $rootScope.MainCtrlRef.currentUserData.interactedGroups[$scope.selectedItemId] = true;
        $rootScope.MainCtrlRef.currentUserData.$save();

    };

    $scope.showContent = function (fieldKey, contentKey) {
        $state.go('index.group_view_content', {
            groupId: $scope.selectedItemId,
            fieldId: fieldKey,
            contentId: contentKey
        });
    };

    $scope.addButtonClick = function (selectedTypeId) {
        $state.go('index.group_add_content', {groupId: $scope.selectedItemId, typeId: selectedTypeId});
    }
}

function GroupAddCtrl($scope, $state, $rootScope, $stateParams, fireFactory) {
    $scope.loading = false;
    $scope.userField = fireFactory.getFieldObject($stateParams.groupId, $stateParams.typeId);
    $scope.userField.$loaded().then(function (loadedData) {
        $scope.field = angular.fromJson((angular.toJson(loadedData)));
    });

    $scope.saveChanges = function () {
        if ($scope.userField.content == null) {
            $scope.userField.content = [];
        }
        var saveContent = $scope.field;
        $scope.field['ownerId'] = $rootScope.MainCtrlRef.userId;
        $scope.field['owner'] = $rootScope.MainCtrlRef.currentUserData.userName;
        $scope.userField.content.push(angular.fromJson(angular.toJson(saveContent)));

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
function _update(srcObj, destObj) {
    for (var key in destObj) {
        if(destObj.hasOwnProperty(key) && srcObj.hasOwnProperty(key)) {
            destObj[key] = srcObj[key];
        }
    }
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
            $scope.removeTagCallback(key, tagToBeRemoved);
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

function EventCtrl($scope, $rootScope, fireFactoryForEvent, $state, contextFactory, MEMBER) {


    $scope.getEventTags = contextFactory.getTagContext;
    $scope.eventCommentTempList = [];

    $scope.eventTags = '';
    $scope.eventManualTags = '';

    $scope.eventRoles = MEMBER.MEMBER_ROLES;

    $scope.initializeEvent = function () {
        $scope.createdEvent = {
            eventPrivacy: "",
            eventTitle: "",
            eventDescription: "",
            eventLocation: "",
            eventDate: "",
            createdBy: "",
            createDate: "",
            updateDate: "",
            eventTagContext: {},
            eventParticipantList: [],
            eventComments: [],
            eventRoles: [],
            ownerName: $rootScope.MainCtrlRef.currentUserData.userName
        };

        $scope.initializeUser();
    };

    $scope.initializeUser = function () {
        $scope.currentUserId = $rootScope.MainCtrlRef.userId;
        $scope.currentUserName = $rootScope.MainCtrlRef.currentUserData.userName;
        $scope.currentUserIsAdmin = $rootScope.MainCtrlRef.currentUserData.isAdmin;
    };

    $scope.initializeEvent();
    $scope.createdEvent.createdBy = $scope.currentUserId;
    $scope.createdEvent.createDate = new Date();
    $scope.createdEvent.updateDate = new Date();

    $scope.addEventComment = function () {

        $scope.createdEvent.eventComments.push({
            "commentBody": $scope.eventCommentTempList.commentBody,
            "commentUserId": $scope.currentUserId,
            "commentUserName": $scope.currentUserName,
            "commentDateTime": new Date().getTime()
        });

        $scope.eventCommentTempList.commentBody = '';

    };

    $scope.saveEventData = function () {

        if (!$scope.createdEvent.eventTitle) {

            alert("You need to enter a title for your event!");
            return;

        }

        if (!$scope.createdEvent.eventDescription) {

            alert("You need to enter a description for your event!");
            return;

        }

        if (!$scope.createdEvent.eventDate) {

            alert("You need to enter a date for your event!");
            return;

        }

        var strippedEvents = angular.fromJson(angular.toJson($scope.createdEvent));
        var fireBaseObj = fireFactoryForEvent.getEventsRef().push(strippedEvents);

        if (!$rootScope.MainCtrlRef.currentUserData.createdEvents) {
            $rootScope.MainCtrlRef.currentUserData.createdEvents = {};
        }

        if (!$rootScope.MainCtrlRef.currentUserData.contexts) {
            $rootScope.MainCtrlRef.currentUserData.contexts = {};
        }

        angular.forEach($scope.createdEvent.eventTagContext, function (value, key) {
            var contextEventsRef = fireFactoryForEvent.getEventsInContextRef(key);
            var eventLinkObject = {};
            eventLinkObject[fireBaseObj.key()] = value.length;
            contextEventsRef.update(eventLinkObject);
            if (!$rootScope.MainCtrlRef.currentUserData.contexts[key]) {
                $rootScope.MainCtrlRef.currentUserData.contexts[key] = 1;
                return;
            }
            $rootScope.MainCtrlRef.currentUserData.contexts[key]++;
        });

        $rootScope.MainCtrlRef.currentUserData.createdEvents[fireBaseObj.key()] = true;
        $scope.loading = true;
        $rootScope.MainCtrlRef.currentUserData.$save().then(function () {
            $scope.loading = false;

                alert("Your event created!");
                $state.go('activity.events2');


        });


    };

}
function ProfileCtrl($scope, $rootScope, fireFactory){
    $scope.init = function () {
        $rootScope.MainCtrlRef.currentUserData.$loaded().then(function (loadedData) {
            $scope.userContexts = loadedData.contexts;
            $scope.contexts = fireFactory.getContextsObject();
            $scope.contexts.$loaded().then(function () {
                var recommendedPeople = {totalCount: 0 ,array:[]};
                angular.forEach($scope.userContexts, function (value, key) {
                    if (!$scope.contexts[key]) {
                        return;
                    }
                    findAndCalculate('users', $scope.contexts[key], loadedData,recommendedPeople,value ,key);
                });
                sortByValue(recommendedPeople.array,'count');
                $scope.people = calculateWeightAndDecide(recommendedPeople,fireFactory.getUserObject);
            })
        });
    };


    $scope.getClass = function (item) {
        if(!item.userImageSmall)
        {
            item.userImageSmall = "img/space_invaders_small.jpg";
        }

        return "feed-element";
    };
    $scope.follow = function (item) {

    };
    $scope.init();

}
function CommentCtrl($scope, $rootScope) {

    $scope.addComments = function () {

        if(!$scope.itemComment){
            $scope.itemComment = [];
        }

        $scope.itemComment.push({
            "commentBody": $scope.commentBody,
            "commentUserId": $rootScope.MainCtrlRef.userId,
            "commentUserName": $rootScope.MainCtrlRef.currentUserData.userName,
            "commentDateTime": new Date().getTime()
        });

        if($scope.addCommentCallback){

            $scope.addCommentCallback($scope.commentBody);

        }
        $scope.commentBody = '';
    };

    $scope.commentDateDifference = function (date) {
        return dateDifference(date);
    };

}

function TabCtrl($scope) {

    var tabs = 1;

    $scope.selectTab = function (setTab) {

        tabs = setTab;

    };

    $scope.isSelected = function (checkTab) {

        return tabs == checkTab;

    };

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
                    findAndCalculate('polls', $scope.contexts[key], loadedData,recommendedPolls,value ,key);
                    findAndCalculate('groups', $scope.contexts[key], loadedData,recommendedGroups,value ,key);
                    findAndCalculate('events', $scope.contexts[key], loadedData,recommendedEvents,value ,key);

                });
                sortByValue(recommendedPolls.array,'count');
                sortByValue(recommendedGroups.array,'count');
                sortByValue(recommendedEvents.array,'count');
                $scope.polls = calculateWeightAndDecide(recommendedPolls,fireFactory.getPollObject);
                $scope.groups = calculateWeightAndDecide(recommendedGroups,fireFactory.getGroupObject);
                $scope.events = calculateWeightAndDecide(recommendedEvents,fireFactory.getEventObject);
            })
        });
        $scope.groupsFromDB = fireFactory.getGroupsObjectAll();
        $scope.pollsFromDB = fireFactory.getPollsObjectAll();
        $scope.searchTerm = '';
        $scope.$watch('searchTerm', function () {

            if($scope.searchTerm.length > 0) {
                $scope.groups = '';
                $scope.polls = '';
                var searchResultGroup = [];
                var searchResultPoll = [];
                angular.forEach($scope.groupsFromDB, function (value, key) {
                    console.log("value: " +  value.description + " key: " + key);
                    var tempSearchTerm = $scope.searchTerm;
                    var tempDescription = value.description;
                    tempSearchTerm = angular.lowercase(tempSearchTerm);
                    tempDescription = angular.lowercase(tempDescription);
                    if(tempDescription.search(tempSearchTerm) > -1) {
                        searchResultGroup.push({key:key,value:fireFactory.getDataTypeObjectById("groups",key)});
                    }
                });

                angular.forEach($scope.pollsFromDB, function (value, key) {
                    console.log("value: " +  value.description + " key: " + key);
                    var tempSearchTerm = $scope.searchTerm;
                    var tempDescription = value.description;
                    tempSearchTerm = angular.lowercase(tempSearchTerm);
                    tempDescription = angular.lowercase(tempDescription);
                    if(tempDescription.search(tempSearchTerm) > -1) {
                        searchResultPoll.push({key:key,value:fireFactory.getDataTypeObjectById("polls",key)});
                    }
                });
                $scope.groups = searchResultGroup;
                $scope.polls = searchResultPoll;
            }
            else{
                $scope.init();
            }
        });
    };
    $scope.init();

}

function calculateWeightAndDecide(recommendation,getObjectCallback){
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
            if(!item.array[y] || hasItem(result,item.array[y].id)){
                skipCount++;
            } else{
                result.push({key:item.array[y].id,value:getObjectCallback(item.array[y].id)});
            }
        }
        totalRecToShow = totalRecToShow - concatValue + skipCount;
        excessWeight = excessWeight + skipCount;
    }
    return result;

}

function hasItem(arrayInput, keyInput){
    for(var y = 0; y < arrayInput.length ; y++){
        if(arrayInput[y].key == keyInput){
            return true;
        }
    }
    return false;
}
function findAndCalculate(itemType, contextItem, userData, outputObject,inputValue,inputKey) {
    var union = [];
    var capitalItemType = capitalizeFirstLetter(itemType);
    angular.forEach(contextItem[itemType], function (value, key) {
        //if (userData['created' + capitalItemType] && userData['created' + capitalItemType][key]) {
        //    return;
        //}
        //if (userData['interacted' + capitalItemType] && userData['interacted' + capitalItemType][key]) {
        //    return;
        //}
        //if (userData['interacted' + capitalItemType] && userData['interacted' + capitalItemType][key]) {
        //    return;
        //}
        if (userData['$id'] && userData.$id == key) {
            return;
        }
        union.push({count:value,id:key});
    });

    sortByValue(union,'count');
    if(union.length != 0){
        outputObject.totalCount = outputObject.totalCount + inputValue;
        outputObject.array.push({
            count: inputValue,
            name: inputKey,
            array: union
        });
    }
}
function sortByValue(items,sortProperty) {
    items.sort(function (a, b) {
        if(sortProperty){
            return b[sortProperty] - a[sortProperty]
        } else {
            return b[Object.keys(b)[0]] - a[Object.keys(a)[0]]
        }
    });
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
    .controller('ProfileCtrl', ProfileCtrl)
    .controller('TabCtrl', TabCtrl)
    .controller('CommentCtrl', CommentCtrl)
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
            helperFactory.getUserImageSmallObject = function (uid) {
                return $firebaseObject(helperFactory.getUserRef(uid).child("userImageSmall"));
            };
            helperFactory.getDataRef = function () {
                return helperFactory.firebaseRef().child('data');
            };

            helperFactory.getGroupsRef = function () {
                return helperFactory.getDataRef().child('groups');
            };

            helperFactory.getGroupsObject = function () {
                return $firebaseObject(helperFactory.getGroupsRef());
            };

            helperFactory.getGroupRef = function (uid) {
                return helperFactory.getGroupsRef().child(uid);
            };

            helperFactory.getGroupObject = function (uid) {
                return $firebaseObject(helperFactory.getGroupRef(uid));
            };
            helperFactory.getPollsRef = function () {
                return helperFactory.getDataRef().child('polls');
            };
            helperFactory.getPollRef = function (uid) {
                return helperFactory.getPollsRef().child(uid);
            };

            helperFactory.getPollObject = function (uid) {
                return $firebaseObject(helperFactory.getPollRef(uid));
            };

            helperFactory.getContextsRef = function () {
                return helperFactory.getDataRef().child('contexts');
            };

            helperFactory.getContextsObject = function () {
                return $firebaseObject(helperFactory.getContextsRef());
            };

            helperFactory.getGroupsInContextRef = function (context) {
                return helperFactory.getContextsRef().child(context).child('groups');
            };

            helperFactory.getGroupsInContextObject = function (context) {
                return $firebaseObject(helperFactory.getGroupsInContextRef(context));
            };

            helperFactory.getUsersInContextRef = function (context) {
                return helperFactory.getContextsRef().child(context).child('users');
            };

            helperFactory.getUsersInContextObject = function (context) {
                return $firebaseObject(helperFactory.getGroupsInContextRef(context));
            };

            helperFactory.getUserInContextRef = function (context,userId) {
                return helperFactory.getUsersInContextRef(context).child(userId);
            };

            helperFactory.getUserInContextObject = function (context,userId) {
                return $firebaseObject(helperFactory.getUserInContextRef(context,userId));
            };

            helperFactory.getFieldObject = function (groupId, fieldId) {
                return $firebaseObject(helperFactory.getGroupsRef().child(groupId).child('fields').child(fieldId));
            };

            helperFactory.getContentObject = function (groupId, fieldId, contentId) {
                return $firebaseObject(helperFactory.getGroupsRef().child(groupId).child('fields').child(fieldId).child('content').child(contentId));
            };

            helperFactory.getDataTypeObjectById = function (dataType,id) {
                return $firebaseObject(helperFactory.getDataRef().child(dataType).child(id));
            };

            helperFactory.getEventsRef = function () {
                return helperFactory.getDataRef().child('events');
            };

            helperFactory.getGroupsObjectAll = function () {
                return $firebaseObject(helperFactory.getGroupsRef());
            };
            helperFactory.getPollsObjectAll = function () {
                return $firebaseObject(helperFactory.getPollsRef());
            };
            helperFactory.getPollsRef = function () {
                return helperFactory.firebaseRef().child('data').child('polls');
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
).factory('fireFactoryForEvent', ['$firebaseObject', '$firebaseArray',
        function fireFactory($firebaseObject, $firebaseArray) {

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

            helperFactory.getEventRef = function (uid) {
                return helperFactory.firebaseRef().child('data').child('events').child(uid);
            };

            helperFactory.getEventObject = function (uid) {
                return $firebaseObject(helperFactory.getEventRef(uid));
            };

            helperFactory.getEventTagRef = function (uid) {
                return helperFactory.firebaseRef().child('data').child('events').child(uid).child("eventTags");
            };

            helperFactory.getEventTagArray = function (uid) {
                return $firebaseArray(helperFactory.getEventTagRef(uid));
            };

            helperFactory.getEventsRef = function () {
                return helperFactory.firebaseRef().child('data').child('events');
            };

            helperFactory.getEventsObject = function () {
                return $firebaseObject(helperFactory.getEventsRef());
            };

            helperFactory.getFieldObject = function (eventId, fieldId) {
                return $firebaseObject(helperFactory.getEventsRef().child(eventId).child('fields').child(fieldId));
            };

            helperFactory.getContentObject = function (eventId, fieldId, contentId) {
                return $firebaseObject(helperFactory.getEventsRef().child(eventId).child('fields').child(fieldId).child('content').child(contentId));
            };

            helperFactory.getEventsInContextRef = function (context) {
                return helperFactory.firebaseRef().child('data').child('contexts').child(context).child('events');
            };
            helperFactory.getDataTypeObjectById = function (dataType, id) {
                return $firebaseObject(helperFactory.firebaseRef().child('data').child(dataType).child(id));
            };
            return helperFactory;

        }]);
