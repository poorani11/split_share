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

// CONTROLLERS
splitshareApp.controller("MyAuthCtrl", ["$scope", "$firebaseAuth",'$location', function($scope, $firebaseAuth,$location) {
    var ref = new Firebase("https://angular-splitwise.firebaseio.com");
    $scope.authObj = $firebaseAuth(ref);
    
    $scope.loginSplit = function(e){
        e.preventDefault();
        ref.authWithPassword({
        email    : $scope.user.email,
        password : $scope.user.password
        }, function(error, authData) {
        if (error) {
        console.log("Login Failed!", error);
        } else {
        console.log("Authenticated successfully with payload:", authData);
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
                    }, function(error) {
                        // do things if failure
                        console.log(error);
                    });
            }
        }
    };

splitshareApp.controller('homeController', ['$scope', "$firebaseArray", function($scope, $firebaseArray){
    var fireData = new Firebase('https://angular-splitwise.firebaseio.com');

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
