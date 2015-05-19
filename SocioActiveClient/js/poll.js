/**
 * Created by Osman Emre on 22.04.2015.
 */

/** @namespace contextFilter.notable */



function PollCtrl($scope, $rootScope, $stateParams, $state, contextFactory, MEMBER, fireFactoryForPoll, semanticTagFactory) {
    $scope.isVotedTemp = false;
    $scope.getPollTags = contextFactory.getTagContext;
    $scope.pollOptionTempList = [];
    $scope.pollCommentTempList = [];
    $scope.pollTagTempList = [];
    $rootScope.pollTagTempList = [];
    $scope.pollTagTempId = '';

    $scope.pollRoles = MEMBER.MEMBER_ROLES;
    $scope.pollToBeViewed = $stateParams.pollToBeViewed;

    $scope.initializePoll = function () {
        $scope.createdPoll = {
            "pollPrivacy": "",
            "pollTitle": "",
            "pollDescription": "",
            "pollOptions": [],
            "pollParticipantList": [],
            "createdBy": "",
            "createDate": "",
            "endDate": "",
            "updateDate": "",
            "pollComments": [],
            "pollTags": [],
            "pollRoles": []
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

        var commentId = guid();

        $scope.createdPoll.pollComments.push({
            "commentId": commentId,
            "commentBody": $scope.pollCommentTempList.commentBody,
            "commentUserEmail": $scope.currentUserId,
            "commentUserName": $scope.currentUserName,
            "commentDateTime": new Date().getTime()
        });

        $scope.pollCommentTempList.commentBody = '';

    };


    //TODO Remove voting in create poll
    $scope.votePoll = function (optionId, optionName, optionDetail, optionVoteCount) {

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

    };

    $scope.savePollData = function () {
        if (!$rootScope.localStoragePollModel.pollTitle) {
            alert("You need to enter a title for your poll!");
            return;
        }

        if (!$rootScope.localStoragePollModel.pollDescription) {
            alert("You need to enter a description for your poll!");
            return;
        }

        if ($scope.isObjectEmpty($rootScope.localStoragePollModel.pollOptions)) {
            alert("You need to add options for your poll!");
            return;
        }

        var saveAfterLoad = function (data, polls) {
            polls.push($rootScope.localStoragePollModel);
            data.$save();
            $scope.mainCtrl.currentUserData.$save();
        };
        var data = fireFactoryForPoll.loadPolls(saveAfterLoad);

        var pollList = getPollListFromLocalStorage();
        pollList[$rootScope.localStoragePollModel.pollId] = $rootScope.localStoragePollModel;
        localStorage.setItem('pollData', JSON.stringify(pollList));
        if ($scope.pollToBeViewed == null) {

            alert("Your poll created!");
            $state.go('activity.polls', {'pollToBeViewed': $rootScope.localStoragePollModel.pollId});

        } else {

            alert("Your changes are saved!");
            $scope.reloadState();
        }
    };

    $scope.isPollDisabled = function () {
        if ($scope.pollToBeViewed == null) {
            return false;

        } else {
            return !(($scope.currentUserEmail == $scope.localStoragePollObject[$scope.pollToBeViewed].createdBy) || $scope.currentUserIsAdmin);
        }
    };

    $scope.reloadState = function () {
        $state.reload();
    };

    $scope.addPollTag = function (context) {
        $rootScope.localStoragePollModel.pollTags[context.tagId] = context;
        if ($scope.pollToBeViewed != null) {
            /*saveData($rootScope.localStoragePollModel.pollId, $rootScope.localStoragePollModel);*/
            var pollList = getPollListFromLocalStorage();
            var tempPoll = pollList[$rootScope.localStoragePollModel.pollId];
            tempPoll.pollTags[tagId] = $rootScope.localStoragePollModel.pollTags[tagId];
            pollList[$rootScope.localStoragePollModel.pollId] = tempPoll;
            localStorage.setItem('pollData', JSON.stringify(pollList));
        }
    };

    $scope.addManualPollTag = function (context) {
        //$rootScope.localStoragePollModel.pollTags[context.tagId] = $scope.pollTagTempList[tagId];
        //if ($scope.pollToBeViewed != null) {
        //    /*saveData($rootScope.localStoragePollModel.pollId, $rootScope.localStoragePollModel);*/
        //    var pollList = getPollListFromLocalStorage();
        //    var tempPoll = pollList[$rootScope.localStoragePollModel.pollId];
        //    tempPoll.pollTags[tagId] = $rootScope.localStoragePollModel.pollTags[tagId];
        //    pollList[$rootScope.localStoragePollModel.pollId] = tempPoll;
        //    localStorage.setItem('pollData', JSON.stringify(pollList));
        //}
    };


    $scope.removeTag = function (tagToBeRemoved) {
        delete $rootScope.localStoragePollModel.pollTags[tagToBeRemoved];
        if ($scope.pollToBeViewed != null) {
            /*saveData($rootScope.localStoragePollModel.pollId, $rootScope.localStoragePollModel);*/
            var pollList = getPollListFromLocalStorage();
            var tempPoll = pollList[$rootScope.localStoragePollModel.pollId];
            tempPoll.pollTags = $rootScope.localStoragePollModel.pollTags;
            pollList[$rootScope.localStoragePollModel.pollId] = tempPoll;
            localStorage.setItem('pollData', JSON.stringify(pollList));
        }
    };

    $scope.pollCommentDateDifference = function (date) {
        if (dateDifference(date) < 60) {
            return dateDifference(date) + " mins";
        } else if (dateDifference(date) < 1440) {
            return Math.round(dateDifference(date) / (60)) + " hours";
        } else {
            return Math.round(dateDifference(date) / (60 * 24)) + " days";
        }
    };
    $scope.isObjectEmpty = function (obj) {
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
    };
    $scope.isPollObjectEmpty = function (obj) {

        return isObjectEmpty(obj);

    };


    $scope.savePollData = function () {

        if (!$scope.createdPoll.pollTitle) {

            alert("You need to enter a title for your poll!");
            return;

        }

        if (!$scope.createdPoll.pollDescription) {

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

function CurrentPollsCtrl($scope, $rootScope, $state, MEMBER, fireFactoryForPoll, $http) {

    $scope.currentUserId = $rootScope.MainCtrlRef.userId;
    $scope.pollRoles = MEMBER.MEMBER_ROLES;
    $scope.hidePollContent = true;
    $scope.selectedPollId = null;
    $scope.polls = fireFactoryForPoll.getPollsObject();
    $scope.pollTagTempId = '';

    $scope.toggle = function (scope) {
        scope.toggle();
    };
    $scope.selectedPoll = null;

    $scope.polls.$watch(function () {
        if ($scope.selectedPollId != null) {
            if (!$scope.polls.hasOwnProperty($scope.selectedPollId)) {
                $scope.hidePollContent = true;
                $scope.selectedPoll = null;
                $scope.selectedPollId = null;
            }

        }
    });

    $scope.getPollOwnerName = function (pollOwnerId) {

        fireFactoryForPoll.getUserObject(pollOwnerId).$loaded().then(function (loadedData) {
            $scope.pollCreatedByName = loadedData.userName;
        });

        return $scope.pollCreatedByName; // TODO buradaki hatay� ��z!
    };

    /*    fireFactoryForPoll.getUserObject('simplelogin:38').$loaded().then(function (loadedData) {
     $scope.pollCreatedByName = loadedData.userName;
     });*/

    $scope.show = function (poll, key) {

        $scope.selectedPoll = poll;
        $scope.selectedPollId = key;
        $scope.hidePollContent = false;

        /*Pristine state of the poll!*/
        fireFactoryForPoll.getPollObject($scope.selectedPollId).$loaded().then(function (loadedData) {
            $scope.selectedPollPristineState = loadedData;
        });

    };

    $scope.getClass = function (poll) {
        if (poll == $scope.selectedPoll) {
            return "list-group-item active";
        }
        return "list-group-item";
    };

    $scope.isPollDisabled = function () {


        if ($scope.selectedPoll == null) {

            return false;

        } else {
            return !(($scope.currentUserId === $scope.selectedPoll.createdBy) || $scope.currentUserIsAdmin);
        }

    };

    $scope.isPollObjectEmpty = function (obj) {

        return isObjectEmpty(obj);

    };

    $scope.votePoll = function (optionKey) {

        fireFactoryForPoll.getPollOptionArray($scope.selectedPollId).$loaded().then(function (loadedData) {

            var item = loadedData.$getRecord(optionKey);
            item.optionVoteCount = item.optionVoteCount + 1;
            loadedData.$save(item).then(function () {
                // data has been saved to Firebase

                $scope.loading = true;
                if (!$rootScope.MainCtrlRef.currentUserData.interactedPolls) {
                    $rootScope.MainCtrlRef.currentUserData.interactedPolls = {};
                }
                $rootScope.MainCtrlRef.currentUserData.interactedPolls[$scope.selectedPollId] = true;
                $rootScope.MainCtrlRef.currentUserData.$save().then(function () {
                    $scope.loading = false;

                    alert("Your vote is saved!");

                });

            });

        });

    };

    $scope.isCurrentUserVoted = function () {

        if ($scope.selectedPoll != null) {

            if (!$rootScope.MainCtrlRef.currentUserData.interactedPolls) {

                return false;
            }

            return $rootScope.MainCtrlRef.currentUserData.interactedPolls[$scope.selectedPollId];
        }

    };

    $scope.addPollOption = function () {

        fireFactoryForPoll.getPollOptionArray($scope.selectedPollId).$loaded().then(function (loadedData) {

            loadedData.$add({

                "optionName": $scope.pollOptionTempList.optionName,
                "optionDetail": $scope.pollOptionTempList.optionDetail,
                "optionVoteCount": 0

            })


        });

    };

    $scope.removePollOption = function (optionToBeRemoved) {

        fireFactoryForPoll.getPollOptionArray($scope.selectedPollId).$loaded().then(function (loadedData) {

            loadedData.$remove(optionToBeRemoved)

        });

    };

    $scope.addPollTagForView = function (tagId) {

        fireFactoryForPoll.getPollTagArray($scope.selectedPollId).$loaded().then(function (loadedData) {

            loadedData.$add($rootScope.pollTagTempList[tagId])

        });

        $scope.pollTagTempId = '';
    };

    $scope.addManualPollTagForView = function (tagName, tagContext, tagContextParentDomain, tagContextChildDomain) {

        var tagId = guid();

        $rootScope.pollTagTempList[tagId] = {
            tagId: tagId,
            tagName: tagName,
            tagContext: tagContext,
            tagContextParentDomain: '',
            tagContextChildDomain: ''
        };

        fireFactoryForPoll.getPollTagArray($scope.selectedPollId).$loaded().then(function (loadedData) {

            loadedData.$add($rootScope.pollTagTempList[tagId])

        });

        $scope.pollTagTempId = '';

    };

    $scope.removeTagForView = function (tagToBeRemoved) {

        fireFactoryForPoll.getPollTagArray($scope.selectedPollId).$loaded().then(function (loadedData) {

            loadedData.$remove(tagToBeRemoved);

        });

    };

    $scope.showContent = function (fieldKey, contentKey) {
        $state.go('create.asd', {pollId: $scope.selectedPollId, fieldId: fieldKey, contentId: contentKey});
    };

    $scope.addButtonClick = function (selectedTypeId) {
        $state.go('activity.group_add_content', {pollIdId: $scope.selectedPollId, typeId: selectedTypeId});
    }

}

function calculateStandardDeviation(values) {
    var avg = calculateAverage(values);

    var squareDiffs = values.map(function (value) {
        var diff = value - avg;
        return diff * diff;


    });

    var avgSquareDiff = calculateAverage(squareDiffs);

    return Math.sqrt(avgSquareDiff);


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
    return diff;
}

angular
    .module('socioactive')
    .factory('semanticTagFactory', ['$http', function semanticFactory($http) {

        var helperFactory = {};

        helperFactory.getTagContext = function (val) {
            $http.get('https://www.googleapis.com/freebase/v1/search', {
                params: {
                    query: val,
                    key: 'AIzaSyBfJNRIjAao3J0PZeO9ALipSJ_k9NjETwc',
                    limit: 50
                }
            }).success(function (result) {

                return result.result;
            });

        };
        return helperFactory;
    }])
    .controller('PollCtrl', PollCtrl)
    .controller('PollTabCtrl', PollTabCtrl)
    .controller('CurrentPollsCtrl', CurrentPollsCtrl)
    .factory('fireFactoryForPoll', ['$firebaseObject', '$firebaseArray',
        function fireFactory($firebaseObject, $firebaseArray) {

            var helperFactory = {};

            helperFactory.firebaseRef = function (path) {
                var baseUrl = "https://resplendent-fire-2746.firebaseio.com";
                path = (path !== '' && path) ? baseUrl + '/' + path : baseUrl;
                return new Firebase(path);
            };
            helperFactory.getData = function () {
                return $firebaseObject(helperFactory.firebaseRef().child('data'));
            };
            helperFactory.loadPolls = function (callback) {
                var data = helperFactory.getData();
                data.$loaded().then(function (loadedData) {
                    if (!loadedData.polls) {
                        loadedData.polls = [];
                    }
                    callback(loadedData, loadedData.polls);
                })
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

            return helperFactory;

        }]);
