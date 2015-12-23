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

    $scope.signupSplit = function(){
        ref.createUser({
          email    : $scope.user.email,
          password : $scope.user.password
        }, function(error, userData) {
          if (error) {
            console.log("Error creating user:", error);
            $scope.regError = true;
            $scope.regErrorMessage = error.message;
          } else {
            console.log("Successfully created user account with uid:", userData.uid);
            // CommonProp.setUser(user.password.email);
            $location.path('/splitsharelist');
            
          }
        });
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
