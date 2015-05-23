/**
 * Created by Osman Emre on 22.04.2015.
 */

/** @namespace contextFilter.notable */


function PollCtrl($scope, $rootScope, $state, contextFactory, MEMBER, fireFactoryForPoll) {

    $scope.isVotedTemp = false;
    $scope.getPollTags = contextFactory.getTagContext;
    $scope.pollOptionTempList = [];
    $scope.pollCommentTempList = [];
    $scope.tags = '';
    $scope.manualTags = '';
    $scope.pollRoles = MEMBER.MEMBER_ROLES;
    $scope.isCreateObject = true;

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
            "commentUserId": $scope.currentUserId,
            "commentUserName": $scope.currentUserName,
            "commentDateTime": new Date().getTime()
        });

        $scope.pollCommentTempList.commentBody = '';

    };

    $scope.reloadState = function () {
        $state.reload();
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

        if ($scope.isPollObjectEmpty($scope.createdPoll.pollTagContext)) {

            alert("You need to add tags for your poll!");
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

        angular.forEach($rootScope.MainCtrlRef.currentUserData.contexts, function (value, key) {
            var userInContext = fireFactoryForPoll.getUserInContextRef(key, $rootScope.MainCtrlRef.userId);
            userInContext.set(value);
        });

        $rootScope.MainCtrlRef.currentUserData.createdPolls[fireBaseObj.key()] = true;
        $scope.loading = true;
        $rootScope.MainCtrlRef.currentUserData.$save().then(function () {
            $scope.loading = false;
                alert("Your poll created!");
                $state.go('activity.pollsv2');
        });


    };

}

function PollTemplateCtrl($rootScope, $scope, MEMBER, contextFactory, $state, fireFactoryForPoll) {

    $scope.isCreateObject = false; //Variable is for the tag! Do not delete!

    $scope.selectedItemId = $scope.$parent.selectedItemId;
    var syncObj = fireFactoryForPoll.getDataTypeObjectById('polls', $scope.selectedItemId);
    syncObj.$bindTo($scope, "selectedItem")
        .then(function () {

            $scope.doughnutData = [];

            angular.forEach($scope.selectedItem.pollOptions, function (value) {

                $scope.doughnutData.push({

                    value: value.optionVoteCount,
                    color: getRandomColor(),
                    highlight: "#2A8B7E",
                    label: value.optionName

                });

            });

            $scope.doughnutOptions = {
                segmentShowStroke: true,
                segmentStrokeColor: "#fff",
                segmentStrokeWidth: 2,
                percentageInnerCutout: 45,
                animationSteps: 250,
                animationEasing: "easeOutQuart",
                animateRotate: true,
                animateScale: false
            };


        });

    $scope.currentUserId = $rootScope.MainCtrlRef.userId;
    $scope.currentUserName = $rootScope.MainCtrlRef.currentUserData.userName;
    $scope.pollRoles = MEMBER.MEMBER_ROLES;

    $scope.pollOptionTempList = [];

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
            return !(($scope.currentUserId === $scope.selectedItem.createdBy) || $scope.currentUserIsAdmin);
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
                    }
                    if (!$rootScope.MainCtrlRef.currentUserData.contexts[key]) {
                        $rootScope.MainCtrlRef.currentUserData.contexts[key] = 1;
                        return;
                    }
                    $rootScope.MainCtrlRef.currentUserData.contexts[key]++;
                });

                $rootScope.MainCtrlRef.currentUserData.$save().then(function () {
                    $scope.loading = false;

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
        if (!$rootScope.MainCtrlRef.currentUserData.interactedPolls) {
            $rootScope.MainCtrlRef.currentUserData.interactedPolls = {};
        }
        if (!$rootScope.MainCtrlRef.currentUserData.contexts) {
            $rootScope.MainCtrlRef.currentUserData.contexts = {};
        }

        var contextPollsRef = fireFactoryForPoll.getPollsInContextRef(tag.tagContext);
        var pollLinkObject = {};

        pollLinkObject[$scope.selectedItemId] = $scope.selectedItem.pollTagContext[tag.tagContext].length;
        contextPollsRef.update(pollLinkObject);

        if (!$rootScope.MainCtrlRef.currentUserData.contexts[tag.tagContext]) {
            $rootScope.MainCtrlRef.currentUserData.contexts[tag.tagContext] = 1;
        } else {
            $rootScope.MainCtrlRef.currentUserData.contexts[tag.tagContext]++;
        }

        $rootScope.MainCtrlRef.currentUserData.interactedPolls[$scope.selectedItemId] = true;
        $scope.loading = true;
        $rootScope.MainCtrlRef.currentUserData.$save();
        $scope.tags = '';
        $scope.manualTags = '';
    };

    $scope.addPollCommentForView = function (body) {
        if (!$scope.selectedItem.pollComments) {
            $scope.selectedItem.pollComments = [];
        }
        $scope.selectedItem.pollComments.push({
            "commentBody": body,
            "commentUserEmail": $scope.currentUserId,
            "commentUserName": $scope.currentUserName,
            "commentDateTime": new Date().getTime()
        });
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

function PollTabCtrl($scope) {

    var tabs = 1;

    $scope.selectTab = function (setTab) {

        tabs = setTab;

    };

    $scope.isSelected = function (checkTab) {

        return tabs == checkTab;

    };

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
    .controller('PollTemplateCtrl', PollTemplateCtrl)
    .controller('CurrentPollsCtrl', CurrentPollsCtrl)
    .controller('PollTabCtrl', PollTabCtrl)
    .factory('fireFactoryForPoll', ['$firebaseObject', '$firebaseArray',
        function fireFactory($firebaseObject, $firebaseArray) {

            var helperFactory = {};

            helperFactory.firebaseRef = function (path) {
                var baseUrl = "https://resplendent-fire-2746.firebaseio.com";
                path = (path !== '' && path) ? baseUrl + '/' + path : baseUrl;
                return new Firebase(path);
            };

            helperFactory.getDataRef = function () {
                return helperFactory.firebaseRef().child('data');
            };

            helperFactory.getUserRef = function (uid) {
                return helperFactory.firebaseRef().child('users').child(uid);
            };

            helperFactory.getUserObject = function (uid) {
                return $firebaseObject(helperFactory.getUserRef(uid));
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
                return helperFactory.getDataRef().child('polls');
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

            helperFactory.getPollsInContextRef = function (context) {
                return helperFactory.getContextsRef().child(context).child('polls');
            };

            helperFactory.getPollsInContextObject = function (context) {
                return $firebaseObject(helperFactory.getPollsInContextRef(context));
            };

            helperFactory.getUsersInContextRef = function (context) {
                return helperFactory.getContextsRef().child(context).child('users');
            };

            helperFactory.getUsersInContextObject = function (context) {
                return $firebaseObject(helperFactory.getPollsInContextRef(context));
            };

            helperFactory.getUserInContextRef = function (context, userId) {
                return helperFactory.getUsersInContextRef(context).child(userId);
            };

            helperFactory.getUserInContextObject = function (context, userId) {
                return $firebaseObject(helperFactory.getUserInContextRef(context, userId));
            };
            return helperFactory;

        }]);
