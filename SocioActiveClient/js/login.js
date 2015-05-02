(function () {
    angular.module('socioactiveStart', [])

})();
function LoginCtrl($scope, $window, $rootScope) {
    $scope.submit = function () {
        var user = getUserFromLocal($rootScope.model);
        if (user == null) {
            alert('There is no User like that');
            return;
        }

        if (user.password != $rootScope.model.password) {
            alert('Wrong Password');
            return;
        }
        sessionStorage.setItem('currentUser', $rootScope.model.email);
        sessionStorage.setItem('currentUserInfo', JSON.stringify(user));
        $window.location.href = 'index.html';
    }
}

function RegisterCtrl($scope, $window, $rootScope, MEMBER) {

    $scope.submit = function () {
        var user = getUserFromLocal($rootScope.model);
        if (user == null) {
            var users = getUsersFromLocal();
            users[$rootScope.model.email] = $rootScope.model;
            localStorage.setItem('users', JSON.stringify(users));
            sessionStorage.setItem('currentUser', $rootScope.model.email);
            sessionStorage.setItem('currentUserInfo', JSON.stringify($rootScope.model));
            $window.location.href = 'index.html';
            return;
        }
        alert('This User Exists');
    };

    $scope.memberRoles = MEMBER.MEMBER_ROLES;
    $rootScope.model.role = MEMBER.MEMBER_ROLES[0];
}

function getUserFromLocal(user) {
    return getUsersFromLocal()[user.email];
}

function getUsersFromLocal() {
    var users = JSON.parse(localStorage.getItem('users'));
    if (users == null) {
        users = {};
    }
    return users;
}
angular
    .module('socioactiveStart')
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
                customTypes: []
            },
            isAdmin: false
        };
    }])
    .controller('RegisterCtrl', RegisterCtrl)
    .controller('LoginCtrl', LoginCtrl);