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
    $scope.emailErrorMessage= '';
    $scope.passwordErrorMessage = '';
    $scope.emailError = function(error) {
        $scope.emailErrorMessage = error.message;
    };
    $scope.passwordError = function(error) {
        $scope.passwordErrorMessage = error.message;
    };

    $scope.errorFunction = {};
    $scope.errorFunction["INVALID_USER"] = $scope.emailError;
    $scope.errorFunction["INVALID_EMAIL"] = $scope.emailError;
    $scope.errorFunction["INVALID_PASSWORD"] = $scope.passwordError;
    $scope.isInError = function(errorString){
        return !(!errorString || errorString == null || errorString == '');
    };

    $scope.submit = function () {
        $scope.loading = true;
        $scope.loginCB = function (error){
            $scope.emailErrorMessage= '';
            $scope.passwordErrorMessage = '';
            $scope.loading = false;
            if (error) {
                if($scope.errorFunction[error.code]){
                    $scope.$apply($scope.errorFunction[error.code](error));
                } else {
                    console.log("Unknown error occurred: ", error);
                }
            }
        };
        fireFactory.loginAndRedirect($rootScope.model, 'index.html',$scope.loginCB);

    };
}

function RegisterCtrl($scope, $window,fireFactory, $rootScope, MEMBER) {

    $scope.emailErrorMessage= '';
    $scope.passwordErrorMessage = '';
    $scope.emailError = function(error) {
        $scope.emailErrorMessage = error.message;
    };
    $scope.passwordError = function(error) {
        $scope.passwordErrorMessage = error.message;
    };
    $scope.isInError = function(errorString){
        return !(!errorString || errorString == null || errorString == '');
    };
    $scope.errorFunction = {};
    $scope.errorFunction["INVALID_USER"] = $scope.emailError;
    $scope.errorFunction["INVALID_EMAIL"] = $scope.emailError;
    $scope.errorFunction["EMAIL_TAKEN"] = $scope.emailError;
    $scope.errorFunction["INVALID_PASSWORD"] = $scope.passwordError;

    $scope.registerCB = function(error, userData){
        $scope.emailErrorMessage= '';
        $scope.passwordErrorMessage = '';
        if (error) {
            if($scope.errorFunction[error.code]){
                $scope.$apply($scope.errorFunction[error.code](error));
                $scope.loading = false;
            } else {
                console.log("Unknown error occurred: ", error);
            }
        } else {
            var createdUserData = fireFactory.getUserData(userData.uid);
            $rootScope.model.userName = $scope.getName($rootScope.model.email);
            angular.copy($rootScope.model, createdUserData);
            createdUserData.$save();
            console.log("Successfully created user account with uid:", userData.uid);
            fireFactory.loginAndRedirect($rootScope.model, 'index.html',function(){$scope.loading = false;});
        }
    };
    $scope.submit = function(){
        $scope.loading = true;
        var registerData = {
            email: $rootScope.model.email,
            password: $rootScope.model.password
        };
        fireFactory.firebaseRef().createUser(registerData, $scope.registerCB);
    };
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
    .factory('fireFactory', [ '$firebaseObject','$window',
        function fireFactory($firebaseObject,$window) {
            var helperFactory = {};
            helperFactory.firebaseRef = function (path) {
                var baseUrl = "https://resplendent-fire-2746.firebaseio.com";
                path = (path !== '' && path) ?  baseUrl + '/' + path : baseUrl;
                return new Firebase(path);
            };
            helperFactory.getUserData = function (uid) {
                return $firebaseObject(helperFactory.firebaseRef().child('users').child(uid));
            };
            helperFactory.getGroups= function () {
                return $firebaseObject(helperFactory.firebaseRef().child('groups'));
            };
            helperFactory.getGroups= function () {
                return $firebaseObject(helperFactory.firebaseRef().child('groups'));
            };
            helperFactory.loginAndRedirect= function (model,redirection,callback) {
                var ref = helperFactory.firebaseRef();
                ref.authWithPassword({
                    email    : model.email,
                    password : model.password
                }, function(error, authData) {
                   if(callback){
                       callback(error);
                   }
                    if (error) {
                        console.log("Error in login: ", error);
                    } else {
                        console.log("Authenticated successfully with payload:", authData);
                        $window.location.href =redirection;
                    }
                }, {
                    remember: "sessionOnly"
                });
            };
            return helperFactory;

        }]
);
