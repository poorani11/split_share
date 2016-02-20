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
    .when('/friends', {
        templateUrl: 'pages/member.html',
        controller: 'memberController'
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
            ref.child('users').child(authData.uid).set({
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



splitshareApp.controller('homeController', ['$scope', '$firebaseArray','$firebase','$location','CommonProp','$firebaseObject', function($scope, $firebaseArray,$firebase,$location, CommonProp,$firebaseObject){
    var fireData = new Firebase('https://angular-splitwise.firebaseio.com');
    var user = CommonProp.getUser();
    $scope.username = user.replace(/@.*/, '');
    $scope.myDate=new Date();
    if(!$scope.username){
        $location.path('/');
    }

    var expenseRef = new Firebase('https://angular-splitwise.firebaseio.com/expenses');
    $scope.expenses = $firebaseArray(expenseRef.orderByChild("emailId").equalTo(user));
    $scope.addExpense = function(){
        console.log($scope.myDate);
        $scope.expenses.$add({
            date:$scope.myDate.getTime(),
            cost:$scope.costInt,
            text:$scope.expenseText,
            emailId: user, 
        });
    $scope.expenseText = ''; 
    $scope.costInt = '';  
    };

    $scope.addUpdate = function(){
        // var firebaseObj = new Firebase('https://angular-splitwise.firebaseio.com/expenses/' + id);
        $('#addModal').modal(); 
    };

    $scope.editExpense = function(id) {
    
        var firebaseObj = new Firebase('https://angular-splitwise.firebaseio.com/expenses/' + id);
         console.log(id);
 
        $scope.postToUpdate =  $firebaseObject(firebaseObj);
        console.log($scope.postToUpdate);
   
 
        $('#editModal').modal(); 

    };


    $scope.update = function() {
        console.log($scope.postToUpdate.$id);
        var fb = new Firebase('https://angular-splitwise.firebaseio.com/expenses/' + $scope.postToUpdate.$id);
        var article = $firebaseArray(fb);
        fb.set({
            date:new Date().getTime(),
            text: $scope.postToUpdate.text,
            cost: $scope.postToUpdate.cost,
            emailId: $scope.postToUpdate.emailId
        });

    };

    $scope.confirmDelete = function(id){
       var firebaseObj = new Firebase('https://angular-splitwise.firebaseio.com/expenses/' + id); 
        console.log(id);
 
        $scope.postToUpdate =  $firebaseObject(firebaseObj);
        console.log($scope.postToUpdate);
   
 
        $('#deleteModal').modal(); 

    };

    $scope.updateDelete = function(){
        var fb = new Firebase('https://angular-splitwise.firebaseio.com/expenses/' + $scope.postToUpdate.$id);
          fb.remove();
    }


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


splitshareApp.controller('memberController', ['$scope', '$firebaseArray','$firebase','$location','CommonProp','$firebaseObject', function($scope, $firebaseArray,$firebase,$location, CommonProp,$firebaseObject){

var fireData = new Firebase('https://angular-splitwise.firebaseio.com');
var user = CommonProp.getUser();
$scope.username = user.replace(/@.*/, '');

var authData = fireData.getAuth();
console.log(authData.uid);
var memberRef = fireData.child('expenses').child(authData.uid).child('members');

$scope.members = $firebaseArray(memberRef);

$scope.addMember = function(){
    $scope.members.$add({
        firstname:$scope.firstnameText,
        surname:$scope.surnameText,
        email:$scope.emailText
    });
};

$scope.addUpdate = function(){
        // var firebaseObj = new Firebase('https://angular-splitwise.firebaseio.com/expenses/' + id);
        $('#addModal').modal(); 
};

$scope.editMember = function(id) {
    
    var firebaseObj = new Firebase('https://angular-splitwise.firebaseio.com/expenses/'+authData.uid+'/members/' + id);
    console.log(id);
 
    $scope.postToUpdate =  $firebaseObject(firebaseObj);
    console.log($scope.postToUpdate);
   
 
    $('#editModal').modal(); 

};

$scope.update = function() {
    console.log($scope.postToUpdate.$id);
    var fb =  new Firebase('https://angular-splitwise.firebaseio.com/expenses/'+authData.uid+'/members/' + $scope.postToUpdate.$id);
    var article = $firebaseArray(fb);
    fb.set({
        firstname: $scope.postToUpdate.firstname,
        surname: $scope.postToUpdate.surname,
        email: $scope.postToUpdate.email
    });

};

$scope.logout = function(){
    CommonProp.logoutUser();
}

}]);