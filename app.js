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
splitshareApp.controller("MyAuthCtrl", ["$scope", "$firebaseAuth",'$location','CommonProp',"$firebaseArray","$firebaseObject", function($scope, $firebaseAuth,$location,CommonProp,$firebaseArray,$firebaseObject) {
    var ref = new Firebase("https://angular-splitwise.firebaseio.com");
    var users_ref = new Firebase("https://angular-splitwise.firebaseio.com/users");
    $scope.authObj = $firebaseAuth(ref);

    $scope.users = $firebaseArray(users_ref);

    $scope.authObj.$onAuth(function(authData) {
        if(authData){
            CommonProp.setUser(authData.password.email);
            $location.path('/');
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
            var userObj = $firebaseObject(users_ref.child(userData.uid));
            userObj.$save();
            $location.path('/splitsharelist');
            
          }
        });
    };
}]);

splitshareApp.controller('homeController', ['$scope', "$firebaseArray",'$firebase','$location','CommonProp', function($scope, $firebaseArray,$firebase,$location, CommonProp){
    var fireData = new Firebase('https://angular-splitwise.firebaseio.com');
    $scope.username = CommonProp.getUser();
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
