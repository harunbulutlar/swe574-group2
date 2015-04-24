/**
 * Created by Osman Emre on 22.04.2015.
 */

function pollCtrl($scope, $rootScope, $stateParams) {

    $scope.isAdmin = false;
    $scope.currentUserId = 1;

    $scope.pollOptionTempList = [];
    $scope.pollCommentTempList = [];
    $scope.currentDateTime = new Date;

    $scope.localStoragePollObject = getPollDataFromLocalStorage();

    if ($scope.localStoragePollObject == null) {
        $scope.localStoragePollObjectCount = 0
    } else {
        $scope.localStoragePollObjectCount = Object.keys($scope.localStoragePollObject).length;
    }


    var pollToBeViewed = null;


    var initialize = function () {
        $rootScope.localStoragePollModelEmpty = {
            "pollId": "",
            "pollPrivacy": "",
            "pollTitle": "",
            "pollDescription": "",
            "pollOptions": [],
            "pollParticipantList": [],
            "createdBy": "",
            "createDate": "",
            "endDate": "",
            "updateDate": "",
            "pollComments": []
        };
    };

    if ($stateParams.pollToBeViewed != null) {

        pollToBeViewed = $stateParams.pollToBeViewed;

        var localStorageForSpecificPoll = getPollDataFromLocalStorage();
        $rootScope.localStoragePollModelEmpty = localStorageForSpecificPoll[pollToBeViewed];

        $scope.currentPollCreateUserId = 1;

    } else {

        initialize();

        $scope.isCreatePoll = true;
        $scope.currentPollCreateUserId = '';

        $rootScope.localStoragePollModelEmpty.pollId = $scope.localStoragePollObjectCount + 1;
        $rootScope.localStoragePollModelEmpty.pollParticipantList = [$scope.currentUserId];
        $rootScope.localStoragePollModelEmpty.createdBy = $scope.currentUserId;
        $rootScope.localStoragePollModelEmpty.createDate = $scope.currentDateTime;
        $rootScope.localStoragePollModelEmpty.updateDate = $scope.currentDateTime;
    }



    /*if (pollToBeViewed == null) {

     $scope.isCreatePoll = true;
     $scope.currentPollCreateUserId = '';

     } else {
     $scope.isCreatePoll = false;
     $scope.currentPollCreateUserId = 1;

     }*/

    /*if ($scope.isCreatePoll == false) {

     var localStorageForSpecificPoll = getPollDataFromLocalStorage();
     $rootScope.localStoragePollModelEmpty = localStorageForSpecificPoll[pollToBeViewed];

     } else {

     $rootScope.localStoragePollModelEmpty.pollId = $scope.localStoragePollObjectCount + 1;
     $rootScope.localStoragePollModelEmpty.pollParticipantList = [$scope.currentUserId];
     $rootScope.localStoragePollModelEmpty.createdBy = $scope.currentUserId;
     $rootScope.localStoragePollModelEmpty.createDate = $scope.currentDateTime;
     $rootScope.localStoragePollModelEmpty.updateDate = $scope.currentDateTime;

     }*/


    $scope.addPollOption = function () {

        $rootScope.localStoragePollModelEmpty.pollOptions.push({
            "optionId": $rootScope.localStoragePollModelEmpty.pollOptions.length + 1,
            "optionName": $scope.pollOptionTempList.optionName,
            "optionDetail": $scope.pollOptionTempList.optionDetail,
            "optionVoteCount": 0
        });

        $scope.pollOptionTempList.optionName = '';
        $scope.pollOptionTempList.optionDetail = '';

    };

    $scope.addPollComment = function () {

        $rootScope.localStoragePollModelEmpty.pollComments.push({
            "commentId": $rootScope.localStoragePollModelEmpty.pollComments.length + 1,
            "commentBody": $scope.pollCommentTempList.commentBody,
            "commentUserId": $scope.currentUserId,
            "commentUserName": "Osman Emre", /*TODO Bunu kullanýcýya baðla*/
            "commentDateTime": $scope.currentDateTime
        });

        $scope.pollCommentTempList.commentBody = '';

    };

    $scope.savePollData = function () {

        var pollOption = getPollDataFromLocalStorage();
        pollOption[$rootScope.localStoragePollModelEmpty.pollId] = $rootScope.localStoragePollModelEmpty;
        localStorage.setItem('pollData', JSON.stringify(pollOption));

        initialize();

    };

    $scope.isDisabled = function (currentUserId, currentPollCreateUserID, isAdmin, isCreatePoll) {

        if (isCreatePoll == true) {

            return false;

        } else {

            if ((currentUserId == currentPollCreateUserID) || isAdmin) {
                return false;
            } else {
                return true;
            }
        }


    }



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
        $rootScope.localStoragePollModelEmpty = {
            "pollId": "",
            "pollPrivacy": "",
            "pollTitle": "",
            "pollDescription": "",
            "pollOptions": [],
            "pollParticipantList": [],
            "createdBy": "",
            "createDate": "",
            "endDate": "",
            "updateDate": "",
            "pollComments": []
        };

    }]);