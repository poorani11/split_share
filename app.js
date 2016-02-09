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
        templateUrl: 'pages/splitshare.html',
        controller: 'homeController'
    })
});

//FACTORIES
splitshareApp.factory('Users',['$firebaseAuth','$firebaseArray','$firebaseObject', function($firebaseAuth,$firebaseArray,$firebaseObject){
    var users_ref = new Firebase("https://angular-splitwise.firebaseio.com/users");
    var users = $firebaseArray(users_ref);
    var Users={
        getProfile: function(uid){
            return $firebaseObject(usersRef.child(uid));
        },
        all:users
    }
    return Users;
}]);

// SERVICES
splitshareApp.service('CommonProp',['$firebaseAuth','$location', function($firebaseAuth,$location) {
    var ref = new Firebase("https://angular-splitwise.firebaseio.com");
    var authObj = $firebaseAuth(ref);
    var user = '';
 
    return {
        getUser: function() {
        if(user == ''){
            user = localStorage.getItem('userEmail');
        }
            return user;
        },
        setUser: function(value) {
            localStorage.setItem("userEmail", value);
            user = value;
        },
        logoutUser:function(){
            authObj.$unauth();
            user='';
            localStorage.removeItem('userEmail');
            console.log('done logout');
            $location.path('/');
        }
    };
}]);

// CONTROLLERS
splitshareApp.controller("MyAuthCtrl", ["$scope", "$firebaseAuth",'$location','CommonProp',"$firebaseArray"
    ,"$firebaseObject","$rootScope", function($scope, $firebaseAuth,$location,CommonProp,$firebaseArray,$firebaseObject,$rootScope) {
    var ref = new Firebase("https://angular-splitwise.firebaseio.com");
    
    $scope.authObj = $firebaseAuth(ref);

    $scope.authObj.$onAuth(function(authData) {
        if(authData){
            console.log('In Auth');
            CommonProp.setUser(authData.password.email);
        }
    });
    $scope.user = {};
    $scope.loginSplit = function(){
        ref.authWithPassword({
        email    : $scope.user.email,
        password : $scope.user.password
        }, function(error,user) {
        if (error) {
        console.log("Login Failed!", error);
        } else {
        CommonProp.setUser(user.password.email);
        console.log("Authenticated successfully with payload");
        console.log($location);
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
                $scope.loginSplit();            
          }
        });
    };
}]);

splitshareApp.controller('homeController', ['$scope', "$firebaseArray",'$firebase','$location','CommonProp', function($scope, $firebaseArray,$firebase,$location, CommonProp){
    var fireData = new Firebase('https://angular-splitwise.firebaseio.com');
    $scope.username = CommonProp.getUser();
    console.log($scope.username);
    if(!$scope.username){
        $location.path('/');
    }
    var user = CommonProp.getUser();

    var expenseRef = new Firebase('https://angular-splitwise.firebaseio.com/expenses');
    $scope.expenses = $firebaseArray(expenseRef.orderByChild("emailId").equalTo($scope.username));

    $scope.addExpense = function(){
        $scope.expenses.$add({
            cost:$scope.costInt,
            text:$scope.expenseText,
            emailId: user, 
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
    $scope.logout = function(){
    CommonProp.logoutUser();
}
}]);
