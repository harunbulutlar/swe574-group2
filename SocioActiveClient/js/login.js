(function () {
    angular.module('socioactiveStart', [])

})();
function LoginCtrl($scope, $window, $rootScope,fireFactory) {
    var ref = fireFactory.firebaseRef();
    var authData = ref.getAuth();

    if (authData) {
        console.log("User " + authData.uid + " is logged in with " + authData.provider);
        $window.location.href = 'index.html';
    } else {
        console.log("User is logged out");
    }

    $scope.submit = function () {
        var ref = fireFactory.firebaseRef();
        ref.authWithPassword({
            email    : $rootScope.model.email,
            password : $rootScope.model.password
        }, function(error, authData) {
            if (error) {
                console.log("Error getting user:", error);
            } else {
                console.log("Successfully got user account with uid:", authData.uid);
                $window.location.href = 'index.html';
            }
        }, {
            remember: "sessionOnly"
        });
    };

}

function RegisterCtrl($scope, $window,fireFactory, $rootScope, MEMBER) {

    $scope.registerClick = function(){
        fireFactory.firebaseRef().createUser({
            email    : $rootScope.model.email,
            password : $rootScope.model.password
        }, function(error, userData) {
            if (error) {
                console.log("Error creating user:", error);
            } else {
                var createdUserData = fireFactory.firebaseRef().child('users').child(userData.uid);
                createdUserData.set({
                        name: $scope.getName($rootScope.model.email),
                        role: $rootScope.model.role
                    });
                console.log("Successfully created user account with uid:", userData.uid);
                $window.location.href = 'login.html';
            }
        });
    };
// find a suitable name based on the meta info given by each provider
    $scope.getName = function(authData) {
        return authData.replace(/@.*/, '');
    };
    $scope.memberRoles = MEMBER.MEMBER_ROLES;
    $rootScope.model.role = MEMBER.MEMBER_ROLES[0];
}
angular
    .module('socioactiveStart', ['firebase'])
    .constant('MEMBER', {"MEMBER_ROLES": ["Undergraduate", "Graduate", "Postgraduate", "Prep Student", "Teaching Assistant", "Research Assistant", "Alumni", "Faculty Staff", "Other"]})
    .run(["$rootScope", function ($rootScope) {
        $rootScope.model = {
            email: '',
            password: '',
            userName:'',
            userLastName:'',
            photo: '',
            role: '',
            data: {
                groups: [],
                events: [],
                polls: [],
                registeredGroups: [],
                registeredEvents: [],
                registeredPolls: [],
                customTypes: [],
                friends:[],
                relatedContext: []
            },
            isAdmin: false
        };
    }])
    .controller('RegisterCtrl', RegisterCtrl)
    .controller('LoginCtrl', LoginCtrl)
    .factory('fireFactory', [
        function fireFactory() {
            return {
                firebaseRef: function(path) {
                    var baseUrl = "https://resplendent-fire-2746.firebaseio.com";
                    path = (path !== '' && path) ?  baseUrl + '/' + path : baseUrl;
                    return new Firebase(path);
                }
            };
    }]);