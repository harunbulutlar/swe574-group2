(function () {
    angular.module('socioactiveStart',[])

})();
function LoginCtrl($scope, $window, $rootScope) {
    $scope.submit = function(){
        var user = getUserFromLocal($rootScope.model);
        if(user == null)
        {
            alert('There is no User like that');
            return;
        }

        if(user.password != $rootScope.model.password)
        {
            alert('Wrong Password');
            return;
        }
        sessionStorage.setItem('currentUser',$rootScope.model.email);
        $window.location.href = 'index.html';
    }
}

function RegisterCtrl($scope, $window, $rootScope, $http) {

    $scope.submit = function () {
        var user = getUserFromLocal($rootScope.model);
        if (user != null) {
        } else {
            var users = getUsersFromLocal();
            users[$rootScope.model.email] = $rootScope.model;
            var postObject = new Object();
            postObject.email = $rootScope.model.email;
            postObject.userData = JSON.stringify(users);
            $http({
                url: 'http://localhost:8080/people',
                dataType: 'json',
                method: 'POST',
                data: postObject,
                headers: {
                    "Content-Type": "application/json"
                }
            }).success(function(response){
                alert("success");
                $scope.response = response;
            }).error(function(error){
                $scope.error = error;
                alert($scope.error);

            });


            localStorage.setItem('users', JSON.stringify(users));
            sessionStorage.setItem('currentUser', $rootScope.model.email);
            $window.location.href = 'index.html';
            return;
        }
        alert('This User Exists');
    }
}


function getUserFromLocal(user)
{
    return getUsersFromLocal()[user.email];
}

function getUsersFromLocal()
{
    var users = JSON.parse(localStorage.getItem('users'));
    if(users == null) {
        users = {};
    }
    return users;
}
angular
    .module('socioactiveStart')
    .run(["$rootScope", function ($rootScope) {
        $rootScope.model = {
            email:'',
            password:'',
            photo:'',
            data:{
                groups:[],
                events:[],
                polls:[],
                registeredGroups:[],
                registeredEvents:[],
                registeredPolls:[],
                customTypes:[]
            }
        };
    }])
    .controller('RegisterCtrl', RegisterCtrl)
    .controller('LoginCtrl', LoginCtrl);