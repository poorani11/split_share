// MODULE
var splitshareApp = angular.module('splitshareApp', ['firebase','ngRoute','ngTagsInput']);

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
    .when('/dashboard/', {
        templateUrl: 'pages/dashboard.html',
        controller: 'dashboardController'
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
                name:authData.password.email.replace(/@.*/, ''),
                email:authData.password.email

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


splitshareApp.controller('memberController', ['$scope', '$firebaseArray','$firebase','$location','CommonProp','$firebaseObject', function($scope, $firebaseArray,$firebase,$location, CommonProp,$firebaseObject){

var fireData = new Firebase('https://angular-splitwise.firebaseio.com');
var user = CommonProp.getUser();
$scope.username = user.replace(/@.*/, '');

var authData = fireData.getAuth();
console.log(authData.uid);
var memberRef = fireData.child('expenses').child(authData.uid).child('members');

$scope.members = $firebaseArray(memberRef);

var user_ref= fireData.child('users');
$scope.users = $firebaseArray(user_ref);
console.log($scope.users);
$scope.addMember = function(){
    new Firebase("https://angular-splitwise.firebaseio.com/users")
            .orderByChild('email')
            .equalTo($scope.emailText)
            .once('child_added', function(snap) {
               $scope.members.$add({
               firstname:$scope.firstnameText,
               surname:$scope.surnameText,
               email:$scope.emailText,
               member_id:snap.key()
            })
        })
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

$scope.confirmDelete = function(id){
    var firebaseObj = new Firebase('https://angular-splitwise.firebaseio.com/expenses/'+authData.uid+'/members/' + id); 
    console.log(id);
 
    $scope.postToUpdate =  $firebaseObject(firebaseObj);
    console.log($scope.postToUpdate);
   
 
    $('#deleteModal').modal(); 

};

$scope.updateDelete = function(){
    var fb =  new Firebase('https://angular-splitwise.firebaseio.com/expenses/'+authData.uid+'/members/' + $scope.postToUpdate.$id);
    fb.remove();
};

$scope.logout = function(){
    CommonProp.logoutUser();
};

}]);

splitshareApp.controller('dashboardController', ['$scope', '$q', '$firebaseArray','$firebase','$location','CommonProp','$firebaseObject', function($scope, $q, $firebaseArray,$firebase,$location, CommonProp,$firebaseObject){
   var fireData = new Firebase('https://angular-splitwise.firebaseio.com');

   var user = CommonProp.getUser();
  $scope.username = user.replace(/@.*/, '');
 
  var expenseRef = new Firebase('https://angular-splitwise.firebaseio.com/expenses');
  $scope.expenses = $firebaseArray(expenseRef);

  var authData = fireData.getAuth();
   console.log(authData.uid);
  var memberRef = fireData.child('expenses').child(authData.uid).child('members');
  $scope.members = $firebaseArray(memberRef);

  var user_ref= fireData.child('users');
  $scope.users = $firebaseArray(user_ref);

  var SharedExpenseRef = fireData.child('expenses').child(authData.uid).child('sharedExpenses');
  $scope.sharedExpenses = $firebaseArray(SharedExpenseRef);

  
  $scope.newMembers = [];
  $scope.myDate=new Date();



    $scope.loadMembers = function(query){
        return $scope.members;
       console.log($scope.firstname);
    };

    $scope.addMembers = function(member){
        console.log('Added: ' + member);
    };

    $scope.removeMembers = function(member){
        console.log('Removed: ' + member);
    };

    var addSharedExpense = function(keysArr){
        $scope.sharedExpenses.$add({
            text:$scope.expenseDescription,
            paid_by:$scope.lender,
            paid_for:$scope.newMembers,
            date:$scope.myDate.getTime(),
            amount:$scope.amount,
            expRefs: keysArr

        });

    };

    $scope.showFriendName = function(friendId) {
        var friends = $scope.users;
        for (var i in friends) {
                if (friends[i].id == friendId) {
                    return friends[i].name;
                }
        }
    };

    $scope.showFriendNames = function(roomie) {
        var friendNames = '';
        for (var i in roomie) {
            var ref = roomie[i];
            var name = ref.firstname;
            friendNames += name;
            if (i <= i.length) {
                friendNames += ', ';
            }
        }

            return friendNames;
    };    

    $scope.addModalExpense = function(){
        // var firebaseObj = new Firebase('https://angular-splitwise.firebaseio.com/expenses/' + id);
        $('#addModal').modal(); 
    };


    $scope.splitExpense = function(){
        var friends = $scope.newMembers;
        var expenses = $scope.sharedExpenses;

        var keysArr = []
        var count = 0

        angular.forEach(friends, function(roomie) {
            var split = 100/friends.length;

            var indivCost = $scope.amount / friends.length;

            $scope.expenses.$add({
                date:$scope.myDate.getTime(),
                cost:indivCost,
                text:$scope.expenseDescription,
                emailId: roomie.email, 
            }).then(function(ref) {
                count++
                keysArr.push(ref.key())
                if (count == friends.length) {
                    addSharedExpense(keysArr)
                }
            }).catch(function(error) {
                console.log("Error:", error);

            })
        });
    };

    $scope.calculateBal = function(){
        console.log('123')
        var friends = $scope.members;
        var expenses = $scope.sharedExpenses;
        var balance = [];

        var promisesArr = []
        promisesArr.push(friends.$loaded());
        
        promisesArr.push(expenses.$loaded());

        $q.all(promisesArr).then(function(result) {
            for( var i = 0 ; i < expenses.length; i++){
                var ref = expenses[i]
                for( var j = 0 ; j < friends.length; j++){
                    var temp = friends[j]
                    if(ref.paid_by == temp.member_id){
                        balance.push({_id:ref.paid_by, name:temp.firstname, owes:[]});
                        for( var k in ref.paid_for){
                            var tem = ref.paid_for[k]
                            var member_id = tem.member_id;
                            balance[balance.length-1].owes.push({_id:member_id, name: tem.firstname, amount:0});
                        }    
                    }
                }
            }
            console.log(expenses.length)
            for( var i = 0 ; i < expenses.length; i++){
                var expense = expenses[i];
                console.log(expense)
                // if(!expense.paid_for) {
                //     continue;
                // }
                var amountPerFriend = expense.amount / expense.paid_for.length;

                for( var j in balance){
                    if(balance[j]._id == expense.paid_by){
                        for( var k in expense.paid_for){
                            for( var l in balance[j].owes){
                                if(balance[j].owes[l]._id == expense.paid_for[k].member_id){
                                    balance[j].owes[l].amount -= amountPerFriend;

                                }
                            }
                        }
                    }
                    else{
                        for( var k in expense.paid_for){
                            if(balance[j]._id == expense.paid_for[k].member_id){
                                for( var l in balance[j].owes){
                                    if(balance[j].owes[l]._id == expense.paid_by){
                                        balance[j].owes[l].amount += amountPerFriend;
                                        break;
                                    }
                                }
                            }

                        }
                    }
                }

            }

            // for( var i in balance){
            //     for ( var j in balance[i].owes){
            //         if(balance[i].owes[j].amount < 0){
            //             balance[i].owes[j].amount = 0;
            //         }
            //     }
            // }
            console.log(JSON.stringify(balance))
            return balance;
        })


    };

    $scope.calculatedBal = $scope.calculateBal()

    $scope.testfunc = function() {
        return "qwert"
    }


    $scope.deleteSharedExpense = function(id){
        
        var firebaseObj = new Firebase('https://angular-splitwise.firebaseio.com/expenses/'+authData.uid+'/sharedExpenses/' + id);
        
        $scope.postToUpdate =  $firebaseObject(firebaseObj);
   
 
        $('#deleteModal').modal(); 
    };
    
    $scope.updateDelete = function(){
        console.log($scope.postToUpdate.$id);
        var fb =  new Firebase('https://angular-splitwise.firebaseio.com/expenses/'+authData.uid+'/sharedExpenses/' + $scope.postToUpdate.$id);
        var article = $firebaseArray(fb);
        var expenseIds = $scope.postToUpdate.expRefs;
        angular.forEach(expenseIds, function(expenseId){
            var fbId = new Firebase('https://angular-splitwise.firebaseio.com/expenses/' + expenseId);
            fbId.remove();
        });
        fb.remove();
    };






    $scope.logout = function(){
        CommonProp.logoutUser();
    };

    
}]);