/**
 * Created by Osman Emre on 22.04.2015.
 */

/** @namespace contextFilter.notable */


function PollCtrl($scope, $rootScope, $stateParams, $state, contextFactory, MEMBER, fireFactoryForPoll) {

    $scope.isVotedTemp = false;
    $scope.getPollTags = contextFactory.getTagContext;
    $scope.pollOptionTempList = [];
    $scope.pollCommentTempList = [];
    $rootScope.pollTagTempList = [];
    $scope.tags = '';
    $scope.manualTags = '';

    $scope.pollRoles = MEMBER.MEMBER_ROLES;

    $scope.pollToBeViewed = $stateParams.pollToBeViewed;

    $scope.initializePoll = function () {
        $scope.createdPoll = {
            pollPrivacy: "",
            title: "",
            description: "",
            pollOptions: [],
            pollParticipantList: [],
            createdBy: "",
            createDate: "",
            endDate: "",
            updateDate: "",
            pollComments: [],
            pollTagContext: {},
            pollRoles: [],
            ownerName: $rootScope.MainCtrlRef.currentUserData.userName
        };

        $scope.initializeUser();
    };

    $scope.initializeUser = function () {
        $scope.currentUserId = $rootScope.MainCtrlRef.userId;
        $scope.currentUserName = $rootScope.MainCtrlRef.currentUserData.userName;
        $scope.currentUserIsAdmin = $rootScope.MainCtrlRef.currentUserData.isAdmin;
    };

    $scope.initializePoll();

    $scope.createdPoll.createdBy = $scope.currentUserId;
    $scope.createdPoll.createDate = new Date();
    $scope.createdPoll.updateDate = new Date();


    $scope.addPollOption = function () {

        var optionId = guid();
        $scope.createdPoll.pollOptions.push({
            "optionId": optionId,
            "optionName": $scope.pollOptionTempList.optionName,
            "optionDetail": $scope.pollOptionTempList.optionDetail,
            "optionVoteCount": 0
        });

        $scope.pollOptionTempList.optionName = '';
        $scope.pollOptionTempList.optionDetail = '';

    };

    $scope.removePollOption = function (optionId) {

        var index = arrayObjectIndexOf($scope.createdPoll.pollOptions, optionId, "optionId");

        $scope.createdPoll.pollOptions.splice(index, 1);

    };

    $scope.addPollComment = function () {

        $scope.createdPoll.pollComments.push({
            "commentBody": $scope.pollCommentTempList.commentBody,
            "commentUserEmail": $scope.currentUserId,
            "commentUserName": $scope.currentUserName,
            "commentDateTime": new Date().getTime()
        });

        $scope.pollCommentTempList.commentBody = '';

    };


    //TODO Remove voting in create poll
    /*$scope.votePoll = function (optionId, optionName, optionDetail, optionVoteCount) {

     $scope.createdPoll.pollOptions[optionId] = {

     "optionId": optionId,
     "optionName": optionName,
     "optionDetail": optionDetail,
     "optionVoteCount": optionVoteCount + 1

     };

     $scope.isVotedTemp = true;
     $scope.createdPoll.pollParticipantList.push($scope.currentUserId);

     };

     $scope.isCurrentUserVoted = function () {

     return (($scope.isVotedTemp == true) ||
     ($scope.createdPoll.pollParticipantList.indexOf($scope.currentUserId) != -1));

     };*/

    $scope.reloadState = function () {
        $state.reload();
    };

    $scope.addPollTag = function (tag) {

        if (!$scope.createdPoll.pollTagContext[tag.tagContext]) {
            $scope.createdPoll.pollTagContext[tag.tagContext] = [];
        }

        $scope.createdPoll.pollTagContext[tag.tagContext].push(tag);

        $scope.tags = '';
        $scope.manualTags = '';

    };

    $scope.addManualPollTag = function (tagName, tagContext) {

        var context = {};
        var tagId = guid();

        context[tagId] = ({
            tagId: tagId,
            name: tagName + '<p style= "font-style: italic" class="pull-right">' + tagContext,
            tagName: tagName,
            tagContext: tagContext,
            tagContextParentDomain: '',
            tagContextChildDomain: '',
            score: ''
        });

        if (!$scope.createdPoll.pollTagContext[tagContext]) {
            $scope.createdPoll.pollTagContext[tagContext] = [];
        }

        $scope.createdPoll.pollTagContext[tagContext].push(context[tagId]);

        $scope.tags = '';
        $scope.manualTags = '';

    };

    $scope.removeTag = function (key, tagToBeRemoved) {


        var index = arrayObjectIndexOf($scope.createdPoll.pollTagContext[key], tagToBeRemoved, "tagId");

        $scope.createdPoll.pollTagContext[key].splice(index, 1);

        if (isObjectEmpty($scope.createdPoll.pollTagContext[key])) {
            delete $scope.createdPoll.pollTagContext[key];
        }
    };

    $scope.pollCommentDateDifference = function (date) {

        return dateDifference(date);

    };

    $scope.isPollObjectEmpty = function (obj) {

        return isObjectEmpty(obj);

    };


    $scope.savePollData = function () {

        if (!$scope.createdPoll.title) {

            alert("You need to enter a title for your poll!");
            return;

        }

        if (!$scope.createdPoll.description) {

            alert("You need to enter a description for your poll!");
            return;

        }

        if ($scope.isPollObjectEmpty($scope.createdPoll.pollOptions)) {

            alert("You need to add options for your poll!");
            return;

        }

        var strippedPolls = angular.fromJson(angular.toJson($scope.createdPoll));
        var fireBaseObj = fireFactoryForPoll.getPollsRef().push(strippedPolls);

        if (!$rootScope.MainCtrlRef.currentUserData.createdPolls) {
            $rootScope.MainCtrlRef.currentUserData.createdPolls = {};
        }

        if (!$rootScope.MainCtrlRef.currentUserData.contexts) {
            $rootScope.MainCtrlRef.currentUserData.contexts = {};
        }

        angular.forEach($scope.createdPoll.pollTagContext, function (value, key) {
            var contextPollsRef = fireFactoryForPoll.getPollsInContextRef(key);
            var pollLinkObject = {};
            pollLinkObject[fireBaseObj.key()] = value.length;
            contextPollsRef.update(pollLinkObject);
            if (!$rootScope.MainCtrlRef.currentUserData.contexts[key]) {
                $rootScope.MainCtrlRef.currentUserData.contexts[key] = 1;
                return;
            }
            $rootScope.MainCtrlRef.currentUserData.contexts[key]++;
        });

        $rootScope.MainCtrlRef.currentUserData.createdPolls[fireBaseObj.key()] = true;
        $scope.loading = true;
        $rootScope.MainCtrlRef.currentUserData.$save().then(function () {
            $scope.loading = false;

            if ($scope.pollToBeViewed == null) {

                alert("Your poll created!");
                $state.go('activity.pollsv2');

            } else {

                alert("Your changes are saved!");
                $scope.reloadState();
            }

        });


    };

    $scope.tagContextList = ["Professional Sports Team",
        "College/University",
        "Place with local areas",
        "Airport",
        "Newspaper",
        "Event"
    ];


}

function PollTabCtrl($scope) {

    var tabs = 1;

    $scope.selectTab = function (setTab) {

        tabs = setTab;

    };

    $scope.isSelected = function (checkTab) {

        return tabs == checkTab;

    };

}

function PollTemplateCtrl($rootScope, $scope, MEMBER, contextFactory, $state, fireFactoryForPoll) {
    $scope.selectedItemId = $scope.$parent.selectedItemId;
    var syncObj = fireFactoryForPoll.getDataTypeObjectById('polls', $scope.selectedItemId);
    syncObj.$bindTo($scope, "selectedItem");
    $scope.getPollTagsForView = contextFactory.getTagContext;
    $scope.currentUserId = $rootScope.MainCtrlRef.userId;
    $scope.currentUserName = $rootScope.MainCtrlRef.currentUserData.userName;
    $scope.pollRoles = MEMBER.MEMBER_ROLES;

    $scope.pollTagTempId = '';
    $scope.pollCommentTempList = [];

    $scope.tags = '';
    $scope.manualTags = '';

    $scope.tagContextList = ["Professional Sports Team",
        "College/University",
        "Place with local areas",
        "Airport",
        "Newspaper",
        "Event"
    ];
    $scope.toggle = function (scope) {
        scope.toggle();
    };

    $scope.isPollDisabled = function () {
        if ($scope.selectedItemId == null) {
            return false;
        } else {
            return !(($scope.currentUserId === $scope.selectedItemId.createdBy) || $scope.currentUserIsAdmin);
        }
    };

    $scope.isPollObjectEmpty = function (obj) {
        return isObjectEmpty(obj);
    };

    $scope.votePoll = function (optionKey) {
        fireFactoryForPoll.getPollOptionArray($scope.selectedItemId).$loaded().then(function (loadedData) {

            var item = loadedData.$getRecord(optionKey);
            item.optionVoteCount = item.optionVoteCount + 1;
            loadedData.$save(item).then(function () {
                // data has been saved to Firebase
                $scope.loading = true;
                if (!$rootScope.MainCtrlRef.currentUserData.interactedPolls) {
                    $rootScope.MainCtrlRef.currentUserData.interactedPolls = {};
                }
                if (!$rootScope.MainCtrlRef.currentUserData.votedPolls) {
                    $rootScope.MainCtrlRef.currentUserData.votedPolls = {};
                }

                $rootScope.MainCtrlRef.currentUserData.interactedPolls[$scope.selectedItemId] = true;
                $rootScope.MainCtrlRef.currentUserData.votedPolls[$scope.selectedItemId] = true;

                angular.forEach($scope.selectedItem.pollTagContext, function (value, key) {
                    if (!$rootScope.MainCtrlRef.currentUserData.contexts) {
                        $rootScope.MainCtrlRef.currentUserData.contexts = {};
                        return;
                    }
                    if (!$rootScope.MainCtrlRef.currentUserData.contexts[key]) {
                        $rootScope.MainCtrlRef.currentUserData.contexts[key] = 1;
                        return;
                    }
                    $rootScope.MainCtrlRef.currentUserData.contexts[key]++;
                });

                $rootScope.MainCtrlRef.currentUserData.$save().then(function () {
                    $scope.loading = false;
                    alert("Your vote is saved!");
                });
            });
        });
    };

    $scope.isCurrentUserVoted = function () {
        if ($scope.selectedItemId != null) {
            if (!$rootScope.MainCtrlRef.currentUserData.votedPolls) {
                return false;
            }
            return $rootScope.MainCtrlRef.currentUserData.votedPolls[$scope.selectedItemId];
        }
    };

    $scope.addPollOption = function () {
        if (!$scope.selectedItem.pollOptions) {
            $scope.selectedItem.pollOptions = [];
        }
        $scope.selectedItem.pollOptions.push({
            "optionName": $scope.pollOptionTempList.optionName,
            "optionDetail": $scope.pollOptionTempList.optionDetail,
            "optionVoteCount": 0
        });
        $scope.pollOptionTempList.optionName = '';
        $scope.pollOptionTempList.optionDetail = '';
    };
    $scope.removePollOption = function (optionToBeRemoved) {
        $scope.selectedItem.pollOptions.splice(optionToBeRemoved, 1);
    };

    $scope.addPollTagForView = function (tag) {
        if (!$scope.selectedItem.pollTagContext) {
            $scope.selectedItem.pollTagContext = {};
        }
        if (!$scope.selectedItem.pollTagContext[tag.tagContext]) {
            $scope.selectedItem.pollTagContext[tag.tagContext] = [];
        }
        $scope.selectedItem.pollTagContext[tag.tagContext].push(tag);
        $scope.tags = '';
        $scope.manualTags = '';

        if (!$rootScope.MainCtrlRef.currentUserData.interactedPolls) {
            $rootScope.MainCtrlRef.currentUserData.interactedPolls = {};
        }
        if (!$rootScope.MainCtrlRef.currentUserData.contexts) {
            $rootScope.MainCtrlRef.currentUserData.contexts = {};
        }

        var contextGroupsRef = fireFactoryForPoll.getPollsInContextRef(tag.tagContext);
        var groupLinkObject = {};
        groupLinkObject[$scope.selectedItemId] = $scope.selectedItem.pollTagContext[tag.tagContext].length;
        contextGroupsRef.update(groupLinkObject);
        if (!$rootScope.MainCtrlRef.currentUserData.contexts[tag.tagContext]) {
            $rootScope.MainCtrlRef.currentUserData.contexts[tag.tagContext] = 1;
        } else {
            $rootScope.MainCtrlRef.currentUserData.contexts[tag.tagContext]++;
        }

        $rootScope.MainCtrlRef.currentUserData.interactedPolls[$scope.selectedItemId] = true;
        $scope.loading = true;
        $rootScope.MainCtrlRef.currentUserData.$save();
    };

    $scope.addManualPollTagForView = function (tagName, tagContext) {
        var context = {};
        var tagId = guid();
        context[tagId] = ({
            tagId: tagId,
            name: tagName + '<p style= "font-style: italic" class="pull-right">' + tagContext,
            tagName: tagName,
            tagContext: tagContext,
            tagContextParentDomain: '',
            tagContextChildDomain: '',
            score: ''
        });
        if (!$scope.selectedItem.pollTagContext) {
            $scope.selectedItem.pollTagContext = {};
        }

        if (!$scope.selectedItem.pollTagContext[tagContext]) {
            $scope.selectedItem.pollTagContext[tagContext] = [];
        }

        $scope.selectedItem.pollTagContext[tagContext].push(context[tagId]);
        $scope.tags = '';
        $scope.manualTags = '';
    };

    $scope.removeTagForView = function (key, tagToBeRemoved) {
        var index = arrayObjectIndexOf($scope.selectedItem.pollTagContext[key], tagToBeRemoved, "tagId");
        $scope.selectedItem.pollTagContext[key].splice(index, 1);
    };

    $scope.addPollCommentForView = function () {
        if (!$scope.selectedItem.pollComments) {
            $scope.selectedItem.pollComments = [];
        }
        $scope.selectedItem.pollComments.push({
            "commentBody": $scope.pollCommentTempList.commentBody,
            "commentUserEmail": $scope.currentUserId,
            "commentUserName": $scope.currentUserName,
            "commentDateTime": new Date().getTime()
        });
        $scope.pollCommentTempList.commentBody = '';
    };

    $scope.pollCommentDateDifference = function (date) {
        return dateDifference(date);

    };

    $scope.showContent = function (fieldKey, contentKey) {
        $state.go('create.asd', {pollId: $scope.selectedItemId, fieldId: fieldKey, contentId: contentKey});
    };

    $scope.addButtonClick = function (selectedTypeId) {
        $state.go('activity.group_add_content', {pollIdId: $scope.selectedItemId, typeId: selectedTypeId});
    };
}

function CurrentPollsCtrl($scope, fireFactoryForPoll) {
    $scope.polls = fireFactoryForPoll.getPollsObject();

}

function calculateAverage(data) {
    var sum = data.reduce(function (sum, value) {
        return sum + value;
    }, 0);

    return sum / data.length;

}

function isObjectEmpty(obj) {

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
        if (obj.hasOwnProperty(key)) return false;
    }

    return true;

}

function dateDifference(date) {

    var curDate = new Date();

    var diff = Math.abs(curDate.getTime() - date);  // difference in milliseconds

    diff = Math.round(diff / (1000 * 60));

    if (diff < 60) {

        return diff + " mins";

    } else if (diff < 1440) {

        return Math.round(diff / (60)) + " hours";

    } else {

        return Math.round(diff / (60 * 24)) + " days";
    }

}

angular
    .module('socioactive')
    .controller('PollCtrl', PollCtrl)
    .controller('PollTabCtrl', PollTabCtrl)
    .controller('CurrentPollsCtrl', CurrentPollsCtrl)
    .controller('PollTemplateCtrl', PollTemplateCtrl)
    .factory('fireFactoryForPoll', ['$firebaseObject', '$firebaseArray',
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

            helperFactory.getPollRef = function (uid) {
                return helperFactory.firebaseRef().child('data').child('polls').child(uid);
            };

            helperFactory.getPollObject = function (uid) {
                return $firebaseObject(helperFactory.getPollRef(uid));
            };


            helperFactory.getPollOptionRef = function (uid) {
                return helperFactory.firebaseRef().child('data').child('polls').child(uid).child("pollOptions");
            };

            helperFactory.getPollOptionArray = function (uid) {
                return $firebaseArray(helperFactory.getPollOptionRef(uid));
            };

            helperFactory.getPollTagRef = function (uid) {
                return helperFactory.firebaseRef().child('data').child('polls').child(uid).child("pollTags");
            };

            helperFactory.getPollTagArray = function (uid) {
                return $firebaseArray(helperFactory.getPollTagRef(uid));
            };

            helperFactory.getPollsRef = function () {
                return helperFactory.firebaseRef().child('data').child('polls');
            };

            helperFactory.getPollsObject = function () {
                return $firebaseObject(helperFactory.getPollsRef());
            };

            helperFactory.getFieldObject = function (pollId, fieldId) {
                return $firebaseObject(helperFactory.getPollsRef().child(pollId).child('fields').child(fieldId));
            };

            helperFactory.getContentObject = function (pollId, fieldId, contentId) {
                return $firebaseObject(helperFactory.getPollsRef().child(pollId).child('fields').child(fieldId).child('content').child(contentId));
            };

            helperFactory.getPollsInContextRef = function (context) {
                return helperFactory.firebaseRef().child('data').child('contexts').child(context).child('polls');
            };
            helperFactory.getDataTypeObjectById = function (dataType, id) {
                return $firebaseObject(helperFactory.firebaseRef().child('data').child(dataType).child(id));
            };
            return helperFactory;

        }]);
