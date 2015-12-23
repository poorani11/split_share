// MODULE
var splitshareApp = angular.module('splitshareApp', ['firebase','ngRoute']);

// ROUTES
splitshareApp.config(function ($routeProvider){

    $routeProvider

    .when('/', {
        templateUrl: 'pages/login.html',
        controller: 'MyAuthCtrl'
    })
    .when('/signup', {
        templateUrl: 'pages/signup.html',
        controller: 'MyAuthCtrl'
    })
    .when('/splitsharelist', {
        templateUrl: 'pages/split-share.html',
        controller: 'homeController'
    })
});

// SERVICES
splitshareApp.service('CommonProp', function() {
    var user = '';
 
    return {
        getUser: function() {
            return user;
        },
        setUser: function(value) {
            user = value;
        }
    };
});

// CONTROLLERS
splitshareApp.controller("MyAuthCtrl", ["$scope", "$firebaseAuth",'$location','CommonProp', function($scope, $firebaseAuth,$location,CommonProp) {
    var ref = new Firebase("https://angular-splitwise.firebaseio.com");
    $scope.authObj = $firebaseAuth(ref);
    $scope.user = {};
    $scope.loginSplit = function(){
        ref.authWithPassword({
        email    : $scope.user.email,
        password : $scope.user.password
        }, function(error,user) {
        if (error) {
        console.log("Login Failed!", error);
        } else {
        console.log("Authenticated successfully with payload");
        CommonProp.setUser(user.password.email);
        $location.path('/splitsharelist');
        }
        });
    };

    $scope.signupSplit = function() {
        if (!$scope.regForm.$invalid) {
            var email = $scope.user.email;
            var password = $scope.user.password;
            if (email && password) {
                auth.$createUser(email, password)
                    .then(function() {
                        // do things if success
                        console.log('User creation success');
                        CommonProp.setUser(user.password.email);
                        $location.path('/splitsharelist');
                    }, function(error) {
                        // do things if failure
                        console.log(error);
                        $scope.regError = true;
                        $scope.regErrorMessage = error.message;
                    });
            }
        }
    };
}]);

splitshareApp.controller('homeController', ['$scope', "$firebaseArray",'CommonProp', function($scope, $firebaseArray, CommonProp){
    var fireData = new Firebase('https://angular-splitwise.firebaseio.com');
    $scope.username = CommonProp.getUser();

    var expenseRef = new Firebase('https://angular-splitwise.firebaseio.com/expenses');
    $scope.expenses = $firebaseArray(expenseRef)
    $scope.addExpense = function(){
        $scope.expenses.$add({
            cost:$scope.costInt,
            text:$scope.expenseText
        });
    $scope.expenseText = ''; 
    $scope.costInt = '';  
    };
    $scope.totalExpense = function(){
        var count = 0;
        angular.forEach($scope.expenses, function(expense){
            count += parseInt(expense.cost);
        });

        return count;
    };
}]);
