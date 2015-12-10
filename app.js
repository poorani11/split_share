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
    
    $scope.loginSplit = function(){
        ref.authWithPassword({
        email    : $scope.email,
        password : $scope.password
        }, function(error, authData) {
        if (error) {
        console.log("Login Failed!", error);
        } else {
        console.log("Authenticated successfully with payload:", authData);
        $location.path('/splitsharelist');
        }
        });
    };

    $scope.signupSplit = function(){
        ref.createUser({
          email    : $scope.email,
          password : $scope.password
        }, function(error, userData) {
          if (error) {
            console.log("Error creating user:", error);
          } else {
            console.log("Successfully created user account with uid:", userData.uid);
            $scope.loginSplit();
            
          }
        });
    };    
}]);

splitshareApp.controller('homeController', ['$scope', function($scope){
    var fireData = new Firebase('https://angular-splitwise.firebaseio.com');
    $scope.expenses = [ 
        {done:false,text:'first'},
        {done:true,text:'second'},
        {done:false,text:'third'}
     ];
    $scope.addExpense = function(){
        var newExpense ={
            done:false,
            text:$scope.expenseText
        };
    $scope.expenses.push(newExpense);
    $scope.expenseText = '';   
    };
}]);