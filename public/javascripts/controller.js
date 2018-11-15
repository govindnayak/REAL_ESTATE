var app = angular.module("realApp");

app.controller('loginController', function($scope,$resource, $location, $http,$window) {

    $scope.main = "Login";
    $scope.username = "";
    $scope.password = "";
    $scope.type = "user";

    $scope.check = function() {
      if($window.localStorage["user"])
        return true;
      else {
        return false;
      }
    }

    $scope.login = function() {
      if($scope.type=="user"){
        $http({
          url: '/login',
          method: 'post',
          data: {
            "username": $scope.username,
            "password": $scope.password
          }
        }).then(function(data) {
          if(data.data.success) {
            $location.path('/dashboard');
            $window.localStorage["user"] = $scope.username;
          }
          else {
            alert(data.data.message);
            location.reload();
          }
        }, function(err){})
      }
      else {
        $http({
          url: '/emplogin',
          method: 'post',
          data: {
            "username": $scope.username,
            "password": $scope.password
          }
        }).then(function(data) {
          if(data.data.success) {
            $location.path('/employee');
            $window.localStorage["user"] = $scope.username;
          }
          else {
            alert(data.data.message);
            location.reload();
          }
        }, function(err){})
      }
    }

    $scope.logout = function() {
    $window.localStorage.clear();

    alert('You have been successfully logged out');
    $location.path('/login');
    location.reload();
  }

  $scope.signup = function(datas) {
    datas.type="user";
    $http({
      url: '/register',
      method: 'post',
      data: datas
    }).then(function(data) {
      alert(data.data.message)
      if(data.data.success) {
        $location.path('/login');
      }
    }, function(err){})
  }
});

app.controller("dashController",function($scope, $http, $resource, $location,$route,$window) {

  var notifications = $resource('/getnotifications?username='+$window.localStorage["user"]);
  notifications.query(function(result){
   $scope.notificationv = result[0].data.result1;
   $scope.notificationi = result[0].data.result2;
   })

  var property = $resource('/getproperty?username='+$window.localStorage["user"]);
  property.query(function(result){
    $scope.property = result[0].data;
    console.log($scope.property);
  })

var data = {};
data.location = "Bengaluru";

$scope.user = $window.localStorage["user"];

  $scope.addwishlist = function(data){
    data.username = $window.localStorage["user"];
    $scope.cur = $window.localStorage["user"] | null;
    $http({
      url: '/addwishlist',
      method: 'post',
      data:data
    }).then(function(data) {
      if(data.data.success) {
        alert("Wishlist updated SUCCESSFULLY");
        $location.path('/dashboard');
      }
      else {
        alert(data.data.message);
      }
    }, function(err){});
  }

  $scope.uploadproperty = function(data){
    data.username = $window.localStorage["user"];
    alert(data);
    $http({
      url: '/uploadproperty',
      method: 'post',
      data: data
    }).then(function(data) {
      if(data.data.success) {
        alert("Property add SUCCESSFULLY");
      }
      else {
        alert(data.data.message);
      }
    }, function(err){});
  }

  $scope.redirect = function(){
  console.log('Page redirected');
  $location.path('/upload');
  }

  $scope.interested = function(id){
    data = {};
    data.propertyid = id;
    data.username = $window.localStorage["user"];
    //alert(data.username);
    //alert(JSON.stringify(data));
    $http({
      url: '/interested',
      method: 'post',
      data:data
    }).then(function(data) {
      if(data.data.success) {
        alert("Your Interest is Recorded SUCCESSFULLY");
      }
      else {
        alert("Your Interest is Recorded SUCCESSFULLY");
      }
    }, function(err){});
  }
});

app.controller("employeeController", function($scope, $http, $resource, $route,$location,$window) {


    var info = $resource('/getverify?username='+$window.localStorage["user"]);
    info.query(function(result){
      $scope.getverify = result[0].data;
      console.log($scope.getverify);
    })

    $scope.verify = function(id){
      data = {};
      data.username = $window.localStorage["user"];
      data.documentid = id;
      $http({
        url: '/verify',
        method: 'post',
        data:data
      }).then(function(data) {
        if(data.data.success) {
          alert("Document is Verified!");
          $location.path('/employee');
          location.reload();
        }
        else {
          alert(JSON.stringify(data.data));
        }
      }, function(err){});
    }
});



app.controller("redirectController",function($scope, $http, $resource, $route,$window,$location) {
  alert("Property has been uploaded successfully!")
  $location.path('/upload');
});
