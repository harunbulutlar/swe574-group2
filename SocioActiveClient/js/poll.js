/**
 * Created by Osman Emre on 22.04.2015.
 */

function pollCtrl($scope, $rootScope, $stateParams, $state) {

    $scope.currentUserId = 2;
    $scope.currentUserName = "Osman Emre"
    $scope.isCreatePoll = false;
    $scope.isVotedTemp = false;

    $scope.pollOptionTempList = [];
    $scope.pollCommentTempList = [];
    $scope.pollTagTempList = [];
    $scope.currentDateTime = new Date;

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
            "pollTags": {}
        };
    };

    if ($scope.pollToBeViewed != null) {

        $rootScope.localStoragePollModel = $scope.localStoragePollObject[$scope.pollToBeViewed];

        $scope.localStoragePollOptionObject = $scope.localStoragePollObject[$scope.pollToBeViewed].pollOptions;


    } else {

        initialize();

        $scope.isCreatePoll = true;
        $scope.localStoragePollOptionObject = null;

        $rootScope.localStoragePollModel.pollId = guid();
        $rootScope.localStoragePollModel.createdBy = $scope.currentUserId;
        $rootScope.localStoragePollModel.createDate = $scope.currentDateTime;
        $rootScope.localStoragePollModel.updateDate = $scope.currentDateTime;
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
            "commentDateTime": $scope.currentDateTime
        });

        $scope.pollCommentTempList.commentBody = '';

    };


    $scope.addPollTag = function () {

        if ($rootScope.localStoragePollModel.pollTags[$scope.pollTagTempList.tagName] != null) {

            alert("You can't add same tag and context! Change the context or tag itself!");

        } else {
            $rootScope.localStoragePollModel.pollTags[$scope.pollTagTempList.tagName] = {
                "tagName": $scope.pollTagTempList.tagName,
                "tagContext": $scope.pollTagTempList.tagContext
            };
        }

        $scope.pollTagTempList.tagName = '';
        $scope.pollTagTempList.tagContext = '';

    };


    $scope.removeTag = function (tagToBeRemoved) {
        delete $rootScope.localStoragePollModel.pollTags[tagToBeRemoved];

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

        if($scope.pollToBeViewed != null){
            $scope.savePollData();
        };


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
            $state.go('activity.polls', { 'pollToBeViewed': $rootScope.localStoragePollModel.pollId});
        }else{

            $scope.reloadState();
        }


    };


    $scope.isDisabled = function (currentUserId, isAdmin) {

        if ($scope.isCreatePoll == true) {

            return false;

        } else {

            if ((currentUserId == $scope.localStoragePollObject[$scope.pollToBeViewed].createdBy) || isAdmin) {
                return false;
            } else {
                return true;
            }
        }

    };

    $scope.reloadState = function() {
        $state.reload();
    };

}

function getPollDataFromLocalStorage() {
    var pollData = JSON.parse(localStorage.getItem('pollData'));
    if (pollData == null) {
        pollData = {};
    }
    return pollData;
}

function pollTabCtrl($scope) {

    var tabs = 1;

    $scope.selectTab = function (setTab) {

        tabs = setTab;

    };

    $scope.isSelected = function (checkTab) {

        return tabs == checkTab;

    };
}

function pollNavigationCtrl($scope) {
    $scope.localStoragePollObjectForNavigation = getPollDataFromLocalStorage();
}

angular
    .module('socioactive')
    .controller('pollCtrl', pollCtrl)
    .controller('pollNavigationCtrl', pollNavigationCtrl)
    .controller('pollTabCtrl', pollTabCtrl)
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
            "pollTags": {}
        };

    }]);