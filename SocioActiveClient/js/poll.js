/**
 * Created by Osman Emre on 22.04.2015.
 */

function PollCtrl($scope, $rootScope, $stateParams, $state, $http, MEMBER) {

    var currentUser = JSON.parse(sessionStorage.getItem('currentUserInfo'));

    $scope.currentUserEmail = currentUser.email;
    $scope.currentUserName = "Osman Emre";
    $scope.currentUserIsAdmin = currentUser.isAdmin;

    $scope.isVotedTemp = false;

    $scope.pollOptionTempList = [];
    $scope.pollCommentTempList = [];
    $scope.pollTagTempList = [];
    $scope.pollTagTempId = [];

    $scope.pollRoles = MEMBER.MEMBER_ROLES;

    $scope.pollToBeViewed = $stateParams.pollToBeViewed;

    $scope.tagContextList = ["Location", "city/town/village", "aa", "bb", "cc", "dd"];

    var initialize = function () {
        $rootScope.localStoragePollModel = {
            "pollId": "",
            "pollPrivacy": "",
            "pollTitle": "",
            "pollDescription": "",
            "pollOptions": {},
            "pollParticipantList": [],
            "createdBy": "",
            "createDate": "",
            "endDate": "",
            "updateDate": "",
            "pollComments": {},
            "pollTags": {},
            "pollRoles": []
        };
    };

    if ($scope.pollToBeViewed != null) {

        $scope.localStoragePollObject = getPollListFromLocalStorage();

        $rootScope.localStoragePollModel = $scope.localStoragePollObject[$scope.pollToBeViewed];


    } else {

        initialize();

        $rootScope.localStoragePollModel.pollId = guid();
        $rootScope.localStoragePollModel.createdBy = $scope.currentUserEmail;
        $rootScope.localStoragePollModel.createDate = new Date();
        $rootScope.localStoragePollModel.updateDate = new Date();
    }


    $scope.addPollOption = function () {

        var optionId = guid();

        $rootScope.localStoragePollModel.pollOptions[optionId] = {
            "optionId": optionId,
            "optionName": $scope.pollOptionTempList.optionName,
            "optionDetail": $scope.pollOptionTempList.optionDetail,
            "optionVoteCount": 0
        };

        $scope.pollOptionTempList.optionName = '';
        $scope.pollOptionTempList.optionDetail = '';

        if ($scope.pollToBeViewed != null) {

            /*saveData($rootScope.localStoragePollModel.pollId, $rootScope.localStoragePollModel);*/

            var pollList = getPollListFromLocalStorage();
            var tempPoll = pollList[$rootScope.localStoragePollModel.pollId];
            tempPoll.pollOptions[optionId] = $rootScope.localStoragePollModel.pollOptions[optionId];
            pollList[$rootScope.localStoragePollModel.pollId] = tempPoll;
            localStorage.setItem('pollData', JSON.stringify(pollList));

        }

    };

    $scope.removePollOption = function (optionId) {

        delete $rootScope.localStoragePollModel.pollOptions[optionId];

    };

    $scope.addPollComment = function () {

        var commentId = guid();

        $rootScope.localStoragePollModel.pollComments[commentId] = {
            "commentId": commentId,
            "commentBody": $scope.pollCommentTempList.commentBody,
            "commentUserEmail": $scope.currentUserEmail,
            "commentUserName": $scope.currentUserName, /*TODO Bunu kullanýcýya baðla*/
            "commentDateTime": new Date().getTime()
        };

        $scope.pollCommentTempList.commentBody = '';

        if ($scope.pollToBeViewed != null) {

            /*saveData($rootScope.localStoragePollModel.pollId, $rootScope.localStoragePollModel);*/

            var pollList = getPollListFromLocalStorage();
            var tempPoll = pollList[$rootScope.localStoragePollModel.pollId];
            tempPoll.pollComments[commentId] = $rootScope.localStoragePollModel.pollComments[commentId];
            pollList[$rootScope.localStoragePollModel.pollId] = tempPoll;
            localStorage.setItem('pollData', JSON.stringify(pollList));

        }

    };

    $scope.votePoll = function (optionId, optionName, optionDetail, optionVoteCount) {

        $rootScope.localStoragePollModel.pollOptions[optionId] = {

            "optionId": optionId,
            "optionName": optionName,
            "optionDetail": optionDetail,
            "optionVoteCount": optionVoteCount + 1

        };

        $scope.isVotedTemp = true;
        $rootScope.localStoragePollModel.pollParticipantList.push($scope.currentUserEmail);

        if ($scope.pollToBeViewed != null) {

            /*saveData($rootScope.localStoragePollModel.pollId, $rootScope.localStoragePollModel);*/

            var pollList = getPollListFromLocalStorage();
            var tempPoll = pollList[$rootScope.localStoragePollModel.pollId];
            tempPoll.pollOptions[optionId] = $rootScope.localStoragePollModel.pollOptions[optionId];
            tempPoll.pollParticipantList.push($scope.currentUserEmail);
            pollList[$rootScope.localStoragePollModel.pollId] = tempPoll;
            localStorage.setItem('pollData', JSON.stringify(pollList));

        }


    };

    $scope.isCurrentUserVoted = function () {

        if ($scope.isVotedTemp == true || $rootScope.localStoragePollModel.pollParticipantList.indexOf($scope.currentUserEmail) != -1) {

            return true;
        } else {

            return false;
        }

    };

    $scope.savePollData = function () {

        if (!$rootScope.localStoragePollModel.pollTitle) {

            alert("You need to enter a title for your poll!")
            return;

        }

        if (!$rootScope.localStoragePollModel.pollDescription) {

            alert("You need to enter a description for your poll!")
            return;

        }

        if ($scope.isObjectEmpty($rootScope.localStoragePollModel.pollOptions)) {

            alert("You need to add options for your poll!")
            return;

        }

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

            if (($scope.currentUserEmail == $scope.localStoragePollObject[$scope.pollToBeViewed].createdBy) || $scope.currentUserIsAdmin) {
                return false;
            } else {
                return true;
            }
        }

    };

    $scope.reloadState = function () {
        $state.reload();
    };

    $scope.getTagContext = function (val) {

        return $http.get('https://www.googleapis.com/freebase/v1/search', {
            params: {
                query: val,
                key: 'AIzaSyBfJNRIjAao3J0PZeO9ALipSJ_k9NjETwc',
                limit: 50
            }
        }).then(function (result) {

            var tagContextRawData = result.data.result;

            var scores = [];
            var contexts = [];

            angular.forEach(tagContextRawData, function (item) {
                scores.push(item.score);
            });

            var scoreAverage = calculateAverage(scores);
            var scoreStandardDeviation = calculateStandardDeviation(scores);
            var scoreTag = scoreAverage - scoreStandardDeviation / 2;

            var tagContextFilteredData = tagContextRawData.filter(function (contextFilter) {
                if (contextFilter.hasOwnProperty('notable') && contextFilter.notable.name != '') {

                    return (contextFilter.name != '') && (contextFilter.score >= scoreTag);
                }
            });

            angular.forEach(tagContextFilteredData, function (item) {
                if (item.hasOwnProperty('notable')) {
                    var tagId = guid();
                    contexts.push({
                        id: tagId,
                        name: item.name + '<p style= "font-style: italic" class="pull-right">' + item.notable.name,
                        score: item.score
                    });

                    $scope.pollTagTempList[tagId] = {
                        tagId: tagId,
                        tagName: item.name,
                        tagContext: item.notable.name
                    };
                }
            });

            return contexts;

        });

    };

    $scope.getTagContextDetail = function (currentTopic) {

        var topic_id = currentTopic;

        return $http.get('https://www.googleapis.com/freebase/v1/topic' + topic_id, {
            params: {
                key: 'AIzaSyBfJNRIjAao3J0PZeO9ALipSJ_k9NjETwc',
                filter: '/location'
            }
        }).then(function (result) {

            $scope.denemeData1 = result.data;

            return $scope.denemeData1;

        });
    };


    $scope.addPollTag = function (tagId) {

        $rootScope.localStoragePollModel.pollTags[tagId] = $scope.pollTagTempList[tagId];

        $scope.pollTagTempId = [];

        if ($scope.pollToBeViewed != null) {

            /*saveData($rootScope.localStoragePollModel.pollId, $rootScope.localStoragePollModel);*/

            var pollList = getPollListFromLocalStorage();
            var tempPoll = pollList[$rootScope.localStoragePollModel.pollId];
            tempPoll.pollTags[tagId] = $rootScope.localStoragePollModel.pollTags[tagId];
            pollList[$rootScope.localStoragePollModel.pollId] = tempPoll;
            localStorage.setItem('pollData', JSON.stringify(pollList));

        }

    };

    $scope.addManualPollTag = function(tagName, tagContext){

        var tagId = guid();

        $scope.pollTagTempList[tagId] = {
            tagId: tagId,
            tagName: tagName,
            tagContext: tagContext
        };

        $rootScope.localStoragePollModel.pollTags[tagId] = $scope.pollTagTempList[tagId];

        $scope.pollTagTempId = [];

        if ($scope.pollToBeViewed != null) {

            /*saveData($rootScope.localStoragePollModel.pollId, $rootScope.localStoragePollModel);*/

            var pollList = getPollListFromLocalStorage();
            var tempPoll = pollList[$rootScope.localStoragePollModel.pollId];
            tempPoll.pollTags[tagId] = $rootScope.localStoragePollModel.pollTags[tagId];
            pollList[$rootScope.localStoragePollModel.pollId] = tempPoll;
            localStorage.setItem('pollData', JSON.stringify(pollList));

        }

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
            if (hasOwnProperty.call(obj, key)) return false;
        }

        return true;

    };
}

function getPollListFromLocalStorage() {
    var pollData = JSON.parse(localStorage.getItem('pollData'));
    if (pollData == null) {
        pollData = {};
    }
    return pollData;
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

function PollNavigationCtrl($scope) {
    $scope.localStoragePollObjectForNavigation = getPollListFromLocalStorage();
}


function calculateStandardDeviation(values) {
    var avg = calculateAverage(values);

    var squareDiffs = values.map(function (value) {
        var diff = value - avg;
        var sqrDiff = diff * diff;
        return sqrDiff;
    });

    var avgSquareDiff = calculateAverage(squareDiffs);

    var stdDev = Math.sqrt(avgSquareDiff);
    return stdDev;
}

function calculateAverage(data) {
    var sum = data.reduce(function (sum, value) {
        return sum + value;
    }, 0);

    var avg = sum / data.length;
    return avg;
}

function dateDifference(date) {

    var curDate = new Date();

    var diff = Math.abs(curDate.getTime() - date);  // difference in milliseconds

    diff = Math.round(diff / (1000 * 60));

    return diff;

}

function saveTempData(pollId, pollData, pollAttribute) {

}


angular
    .module('socioactive')
    .controller('PollCtrl', PollCtrl)
    .controller('PollNavigationCtrl', PollNavigationCtrl)
    .controller('PollTabCtrl', PollTabCtrl)
    .run(["$rootScope", function ($rootScope) {
        $rootScope.localStoragePollModel = {
            "pollId": "",
            "pollPrivacy": "",
            "pollTitle": "",
            "pollDescription": "",
            "pollOptions": {},
            "pollParticipantList": [],
            "createdBy": "",
            "createDate": "",
            "endDate": "",
            "updateDate": "",
            "pollComments": {},
            "pollTags": {},
            "pollRoles": []
        };

    }]);