/**
 * Created by Osman Emre on 22.04.2015.
 */

function pollCtrl($scope, $rootScope, $stateParams) {

    $scope.currentUserId = 2;
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

    var pollToBeViewed = null;

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

    if ($stateParams.pollToBeViewed != null) {

        pollToBeViewed = $stateParams.pollToBeViewed;

        $rootScope.localStoragePollModel = $scope.localStoragePollObject[pollToBeViewed];

        $scope.currentPollCreateUserId = 1;

        $scope.localStoragePollOptionObject = $scope.localStoragePollObject[pollToBeViewed].pollOptions;


    } else {

        initialize();

        $scope.isCreatePoll = true;
        $scope.currentPollCreateUserId = '';
        $scope.localStoragePollOptionObject = null;

        $rootScope.localStoragePollModel.pollId = $scope.localStoragePollObjectCount + 1;
        $rootScope.localStoragePollModel.createdBy = $scope.currentUserId;
        $rootScope.localStoragePollModel.createDate = $scope.currentDateTime;
        $rootScope.localStoragePollModel.updateDate = $scope.currentDateTime;
    }


    $scope.addPollOption = function () {

        if ($scope.localStoragePollOptionObject == null) {
            $scope.localStoragePollOptionObjectCounter = Object.keys($scope.localStoragePollModel.pollOptions).length;
        } else {
            $scope.localStoragePollOptionObjectCounter = Object.keys($scope.localStoragePollObject[pollToBeViewed].pollOptions).length;
        }

        $rootScope.localStoragePollModel.pollOptions[$scope.localStoragePollOptionObjectCounter + 1] = {
            "optionId": $scope.localStoragePollOptionObjectCounter + 1,
            "optionName": $scope.pollOptionTempList.optionName,
            "optionDetail": $scope.pollOptionTempList.optionDetail,
            "optionVoteCount": 0
        };

        $scope.pollOptionTempList.optionName = '';
        $scope.pollOptionTempList.optionDetail = '';

    };

    $scope.addPollComment = function () {

        $rootScope.localStoragePollModel.pollComments.push({
            "commentId": $rootScope.localStoragePollModel.pollComments.length + 1,
            "commentBody": $scope.pollCommentTempList.commentBody,
            "commentUserId": $scope.currentUserId,
            "commentUserName": "Osman Emre", /*TODO Bunu kullanýcýya baðla*/
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

    /*TODO bunu optionId li hale getir!! optionId'yi bir level üste çýkarýrsan olur*/
    $scope.votePoll = function (optionId, optionName, optionDetail, optionVoteCount, votedBy) {

        $rootScope.localStoragePollModel.pollOptions[optionId] = {

            "optionId": optionId,
            "optionName": optionName,
            "optionDetail": optionDetail,
            "optionVoteCount": optionVoteCount + 1

        };

        $scope.isVotedTemp = true;
        $rootScope.localStoragePollModel.pollParticipantList.push(votedBy);

    };

    $scope.isCurrentUserVoted = function(currentUser){

        if($scope.isVotedTemp == true || $rootScope.localStoragePollModel.pollParticipantList.indexOf(currentUser ) != -1){

            return true;
        }else{

            return false;
        }

    };

    $scope.savePollData = function () {

        var pollOption = getPollDataFromLocalStorage();
        pollOption[$rootScope.localStoragePollModel.pollId] = $rootScope.localStoragePollModel;
        localStorage.setItem('pollData', JSON.stringify(pollOption));

        initialize();

    };


    $scope.isDisabled = function (currentUserId, isAdmin) {

        if ($scope.isCreatePoll == true) {

            return false;

        } else {

            if ((currentUserId == $scope.localStoragePollObject[pollToBeViewed].createdBy) || isAdmin) {
                return false;
            } else {
                return true;
            }
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