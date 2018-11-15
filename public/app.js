var app = angular.module("realApp", ['ngResource', 'ngRoute']);

app.config(function($routeProvider) {
  $routeProvider
  .when('/login', {
    templateUrl: '/views/login.html',
    controller: 'loginController'
  })
  .when('/register', {
    templateUrl: '/views/signup.html',
    controller: 'loginController'
  })
  .when('/dashboard', {
    templateUrl: '/views/dashboard.html',
    controller: 'dashController'
  })
  .when('/upload', {
    templateUrl: '/views/upload.html',
    controller: 'dashController'
  })
  .when('/property', {
    templateUrl: '/views/property.html',
    controller: 'dashController'
  })
  .when('/notification', {
    templateUrl: '/views/notification.html',
    controller: 'dashController'
  })
  .when('/wishlist', {
    templateUrl: '/views/wishlist.html',
    controller: 'dashController'
  })
  .when('/employee', {
    templateUrl: '/views/employee.html',
    controller: 'employeeController'
  })
  .when('/uploadproperty',{
    templateUrl: '/views/upload.html',
    controller: 'dashController'
  })
  .when('/redirect',{
    templateUrl: '/views/upload.html',
    controller: 'redirectController'
  })
  .otherwise({
    redirectTo: '/login'
  })
});
