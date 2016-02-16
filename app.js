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
    
    $scope.authObj = $firebaseAuth(ref);

    var users_ref = ref.child('users');
    

    var isNewUser = true;


    $scope.authObj.$onAuth(function(authData) {
        if(authData && isNewUser){
            users_ref.child(authData.uid).set({
                listid:null,
                noItems:true,
                id:authData.uid,
                provider:'email',
                name:authData.password.email.replace(/@.*/, '')

            });
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
                $location.path('/');
            
          }
        });
    };
}]);

splitshareApp.controller('expenseController',['$scope','$firebase','$firebaseArray','$firebaseObject','$location','$routeParams', function($scope, $firebase, $firebaseArray,$firebaseObject,$location,$routeParams){
    var fireData = new Firebase('https://angular-splitwise.firebaseio.com');
    var watcher = $firebaseArray(fireData);

    $scope.userdata.listid = $routeParams.id;

    $scope.product = {
        error:false,
        price:null,
        id:null
    }
    $scope.toBuy = function(tobuyid){
        $scope.product.id = tobuyid;
    };

    $scope.buyitem = function(){
        var price = $scope.product.price;
        if(isNaN(price) || price === null || price === '' || price < 0){
            $scope.product.error = true;
        }
        else{
            var baseref  = fireData.child('lists').child($scope.userdata.listid);
            var tobuyref = baseref.child('tobuy').child($scope.product.id);

            $firebaseObject(tobuyref).$loaded.then(function(tobuy){
                var toBuyName = tobuy.name;

                var newproduct = {
                    amended: false,
                    date:new Date().getTime(),
                    name:toBuyName,
                    owner:$scope.userdata.id,
                    price:$scope.product.price
                };

                baseref.child('bought').push(newproduct);
                tobuyref.remove();

                $scope.product = {
                    error: false,
                    price: null,
                    id: null
                };

            });

        }
        
    };


}]);

splitshareApp.controller('homeController', ['$scope', '$firebaseArray','$firebase','$location','CommonProp', function($scope, $firebaseArray,$firebase,$location, CommonProp){
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
            date:new Date().getTime(),
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
