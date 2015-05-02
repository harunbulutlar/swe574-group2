/**
 * Created by Osman Emre on 22.04.2015.
 */

function PollCtrl($scope, $rootScope, $stateParams, $state, $http, MEMBER) {

    $scope.currentUserId = 2;
    $scope.currentUserName = "Osman Emre";
    $scope.isVotedTemp = false;

    $scope.pollOptionTempList = [];
    $scope.pollCommentTempList = [];
    $scope.pollTagTempList = [];
    $scope.pollTagTempId = [];

    $scope.pollRoles = MEMBER.MEMBER_ROLES;

    $scope.localStoragePollObject = getPollDataFromLocalStorage();

    if ($scope.localStoragePollObject == null) {
        $scope.localStoragePollObjectCount = 0
    } else {
        $scope.localStoragePollObjectCount = Object.keys($scope.localStoragePollObject).length;
    }

    $scope.pollToBeViewed = $stateParams.pollToBeViewed;

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
            "pollComments": [],
            "pollTags": {},
            "pollRoles": []
        };
    };

    if ($scope.pollToBeViewed != null) {

        $rootScope.localStoragePollModel = $scope.localStoragePollObject[$scope.pollToBeViewed];

        $scope.localStoragePollOptionObject = $scope.localStoragePollObject[$scope.pollToBeViewed].pollOptions;


    } else {

        initialize();

        $scope.localStoragePollOptionObject = null;

        $rootScope.localStoragePollModel.pollId = guid();
        $rootScope.localStoragePollModel.createdBy = $scope.currentUserId;
        $rootScope.localStoragePollModel.createDate = new Date();
        $rootScope.localStoragePollModel.updateDate = new Date();
    }


    $scope.addPollOption = function () {

        if ($scope.localStoragePollOptionObject == null) {
            $scope.localStoragePollOptionObjectCounter = Object.keys($scope.localStoragePollModel.pollOptions).length;
        } else {
            $scope.localStoragePollOptionObjectCounter = Object.keys($scope.localStoragePollObject[$scope.pollToBeViewed].pollOptions).length;
        }

        var optionID = guid();

        $rootScope.localStoragePollModel.pollOptions[optionID] = {
            "optionId": optionID,
            "optionName": $scope.pollOptionTempList.optionName,
            "optionDetail": $scope.pollOptionTempList.optionDetail,
            "optionVoteCount": 0
        };

        $scope.pollOptionTempList.optionName = '';
        $scope.pollOptionTempList.optionDetail = '';

    };

    $scope.addPollComment = function () {

        $rootScope.localStoragePollModel.pollComments.push({
            "commentId": guid(),
            "commentBody": $scope.pollCommentTempList.commentBody,
            "commentUserId": $scope.currentUserId,
            "commentUserName": $scope.currentUserName, /*TODO Bunu kullanýcýya baðla*/
            "commentDateTime": new Date().getTime()
        });

        $scope.pollCommentTempList.commentBody = '';

    };

    $scope.votePoll = function (optionId, optionName, optionDetail, optionVoteCount, votedBy) {

        $rootScope.localStoragePollModel.pollOptions[optionId] = {

            "optionId": optionId,
            "optionName": optionName,
            "optionDetail": optionDetail,
            "optionVoteCount": optionVoteCount + 1

        };

        $scope.isVotedTemp = true;
        $rootScope.localStoragePollModel.pollParticipantList.push(votedBy);

        if ($scope.pollToBeViewed != null) {
            $scope.savePollData();
        }


    };

    $scope.isCurrentUserVoted = function (currentUser) {

        if ($scope.isVotedTemp == true || $rootScope.localStoragePollModel.pollParticipantList.indexOf(currentUser) != -1) {

            return true;
        } else {

            return false;
        }

    };

    $scope.savePollData = function () {

        var pollOption = getPollDataFromLocalStorage();
        pollOption[$rootScope.localStoragePollModel.pollId] = $rootScope.localStoragePollModel;
        localStorage.setItem('pollData', JSON.stringify(pollOption));
        if ($scope.pollToBeViewed == null) {
            $state.go('activity.polls', {'pollToBeViewed': $rootScope.localStoragePollModel.pollId});
        } else {

            $scope.reloadState();
        }


    };


    $scope.isPollDisabled = function (currentUserId, isAdmin) {

        if ($scope.pollToBeViewed == null) {

            return false;

        } else {

            if ((currentUserId == $scope.localStoragePollObject[$scope.pollToBeViewed].createdBy) || isAdmin) {
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
            var scoreTag = scoreAverage - scoreStandardDeviation/2;

            var tagContextFilteredData = tagContextRawData.filter(function (contextFilter) {
                return (contextFilter.name != '') && (contextFilter.score >= scoreTag);
            });

            angular.forEach(tagContextFilteredData, function (item) {
                if (item.hasOwnProperty('notable')) {
                    var tagId = guid();
                    contexts.push({id: tagId, name: item.name + '<p style= "font-style: italic" class="pull-right">' + item.notable.name, score: item.score});
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


    $scope.addPollTag = function (tagId) {

        $rootScope.localStoragePollModel.pollTags[tagId] = $scope.pollTagTempList[tagId];

        $scope.pollTagTempId = [];

    };


    $scope.removeTag = function (tagToBeRemoved) {
        delete $rootScope.localStoragePollModel.pollTags[tagToBeRemoved];

    };

    $scope.pollCommentDateDifference = function (date) {
        if(dateDifference(date) <  60){

            return dateDifference(date) + " mins";

        }else if (dateDifference(date) < 1440){

            return Math.round(dateDifference(date) / (60)) + " hours";

        }else{

            return Math.round(dateDifference(date) / (60 * 24)) + " days";
        }



    };
}

function getPollDataFromLocalStorage() {
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
    $scope.localStoragePollObjectForNavigation = getPollDataFromLocalStorage();
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

function dateDifference (date){

    var curDate = new Date();

    var diff = Math.abs(curDate.getTime() - date);  // difference in milliseconds

    diff = Math.round(diff / (1000 * 60));

    return diff;

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
            "pollComments": [],
            "pollTags": {},
            "pollRoles": []
        };

    }]);