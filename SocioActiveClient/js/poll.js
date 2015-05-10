/**
 * Created by Osman Emre on 22.04.2015.
 */

/** @namespace contextFilter.notable */


function PollCtrl($scope, $rootScope, $stateParams, $state, $http, MEMBER, fireFactoryForPoll) {






    $scope.isVotedTemp = false;

    $scope.pollOptionTempList = [];
    $scope.pollCommentTempList = [];
    $scope.pollTagTempList = [];
    $scope.pollTagTempId = [];

    $scope.pollRoles = MEMBER.MEMBER_ROLES;

    $scope.pollToBeViewed = $stateParams.pollToBeViewed;


    $scope.initialize = function () {
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

        $scope.initializeUser();
    };


    $scope.initializeUser = function () {
        $scope.mainCtrl = this.main;

        $scope.currentUserEmail = $scope.mainCtrl.email;
        $scope.currentUserName = $scope.mainCtrl.userName;
        $scope.currentUserIsAdmin = this.userIsAdmin;
    };

    if ($scope.pollToBeViewed != null) {

        $scope.localStoragePollObject = getPollListFromLocalStorage();

        $rootScope.localStoragePollModel = $scope.localStoragePollObject[$scope.pollToBeViewed];

        $scope.initializeUser();

    } else {

        $scope.initialize();

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

        return (($scope.isVotedTemp == true) ||
        ($rootScope.localStoragePollModel.pollParticipantList.indexOf($scope.currentUserEmail) != -1));







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

        var saveAfterLoad = function(data, polls){
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
                        tagContext: item.notable.name,
                        tagContextParentDomain: getTagContextParentDomain(item.notable.id),
                        tagContextChildDomain: getTagContextChildDomain(item.notable.id)
                    };



                }
            });

            return contexts;

        });

    };

    /*    $scope.getTagContextDetail = function (currentTopic) {



     return $http.get('https://www.googleapis.com/freebase/v1/topic' + currentTopic, {
     params: {




     }





     }).then(function (result) {

     $scope.denemeData1 = result.data;

     return $scope.denemeData1;

     });
     };*/



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

    $scope.addManualPollTag = function (tagName, tagContext, tagContextParentDomain, tagContextChildDomain) {

        var tagId = guid();

        $scope.pollTagTempList[tagId] = {
            tagId: tagId,
            tagName: tagName,
            tagContext: tagContext,
            tagContextParentDomain: tagContextParentDomain,
            tagContextChildDomain: tagContextChildDomain
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
            if (obj.hasOwnProperty(key)) return false;
        }

        return true;

    };

    $scope.tagContextList = ["Professional Sports Team",
        "College/University",
        "Place with local areas",
        "Airport",
        "Newspaper",
        "Event",
        "Architectural style",
        "Music theatre Play",
        "Soccer team",
        "Soft rock Artist",
        "Art Gallery",
        "Archdiocese",
        "Conducted Ensemble",
        "Film festival",
        "Mass Transportation System",
        "Neighborhood",
        "Organisation",
        "Musical comedy Film",
        "Fire",
        "School district",
        "Location",
        "Government Agency",
        "City/Town/Village",
        "Administrative Division",
        "Structure",
        "System of nobility",
        "Museum",
        "City/Town/Village",
        "Sports Facility",
        "Arms industry Business",
        "Musical Recording",
        "Composition",
        "Consumer electronics Business",
        "Operating System",
        "Office suite Software",
        "Spreadsheet Software",
        "Word processor Software",
        "Software framework Software",
        "E-mail client Software",
        "Relational database management system Software",
        "Content management system Software",
        "Integrated development environment Software",
        "Presentation Software",
        "Collaborative Software",
        "Web portal Website",
        "Computer and video game industry Business",
        "Website",
        "Software",
        "Search engine Website",
        "Web application Software",
        "Video Game Developer",
        "Computer",
        "Brand",
        "Programming Language",
        "Operating system Software",
        "Desktop publishing Software",
        "Literature Subject",
        "Video Game Series",
        "Film series",
        "Fantasy Book",
        "Animation Film",
        "Fantasy Film",
        "Broadcast Content",
        "MMORPG Video Game",
        "Olympic Basketball Player",
        "Game",
        "Action role-playing Video Game",
        "Product line",
        "Role-playing Video Game",
        "Multiplayer Video Game",
        "Real-time strategy Video Game",
        "Work of Fiction",
        "Psychedelic rock Album",
        "Soundtrack",
        "Politician",
        "Role-playing Game",
        "Film score Artist",
        "Hard rock Artist",
        "Heavy metal Album",
        "Rhythm Video Game",
        "Organism Classification",
        "Thriller Film",
        "Non-Fiction Book",
        "Rockumentary Film",
        "Concert tour",
        "Thrash metal Album",
        "Composition",
        "Musical Album",
        "Cello rock Album",
        "Documentary Film",
        "Consumer product",
        "Biological Genus",
        "Business Operation",
        "Biological Species",
        "Compact Cassette Musical Release",
        "Compact Disc Musical Release",
        "Record label",
        "Digital media Musical Release",
        "Magazine",
        "Astronomical Discovery",
        "Film character",
        "Opera",
        "Recurring event",
        "Music Festival",
        "Fictional Object",
        "Product category",
        "Drug form shape",
        "Award category",
        "Film subject",
        "Sport",
        "Protocol",
        "Chemical Compound",
        "Country",
        "Profession",
        "Crime Fiction Film",
        "Field of study",
        "Ethnicity",
        "American Football player",
        "Chinese Film",
        "Trade journal Magazine",
        "US President",
        "Job title",
        "Quotation Subject",
        "Industry",
        "Crime Fiction Book",
        "Folk Artist",
        "Suspense Book",
        "Olympic games",
        "Spanish province",
        "Basketball Team",
        "Team handball Team",
        "Tennis Tournament",
        "Religious Jurisdiction",
        "Neo-gothic Structure",
        "Olympic event competition",
        "Railway",
        "Multi-event tournament",
        "Opera House",
        "Opera Album",
        "Noble person",
        "Modern Art Museum",
        "Soccer Midfielder",
        "Man",
        "TV Episode",
        "TV Character",
        "Soccer",
        "Award",
        "Sports League Award Type",
        "TV Program",
        "Tourist attraction",
        "Award ceremony",
        "Sports League Championship Event",
        "Soccer Organization",
        "Sports Video Game",
        "Sports League Season",
        "Football League Season",
        "Artist"
    ];
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

function dateDifference(date) {

    var curDate = new Date();

    var diff = Math.abs(curDate.getTime() - date);  // difference in milliseconds

    diff = Math.round(diff / (1000 * 60));

    return diff;

}

function getTagContextParentDomain(notableId) {
    return notableId.split("/")[1];
}



function getTagContextChildDomain(notableId) {
    return notableId.split("/")[2];
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

    }])
    .factory('fireFactoryForPoll', ['$firebaseObject',
        function fireFactory($firebaseObject) {
            var helperFactory = {};
            helperFactory.firebaseRef = function (path) {
                var baseUrl = "https://resplendent-fire-2746.firebaseio.com";
                path = (path !== '' && path) ?  baseUrl + '/' + path : baseUrl;
                return new Firebase(path);
            };
            helperFactory.getData = function () {
                return $firebaseObject(helperFactory.firebaseRef().child('data'));
            };
            helperFactory.loadPolls = function (callback) {
                var data = helperFactory.getData();
                data.$loaded().then(function(loadedData){
                    if(!loadedData.polls){
                        loadedData.polls = [];
                    }
                    callback(loadedData,loadedData.polls);
                })
            };
            return helperFactory;
        }]);
