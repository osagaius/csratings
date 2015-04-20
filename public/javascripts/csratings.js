var app = angular.module('csratings', ['ngRoute', 'ngResource']).run(function($rootScope) {	
	$rootScope.signout = function(){
		$rootScope.authenticated = false;
		$rootScope.current_user = '';
    	$http.get('auth/signout');
	};
});

app.config(function($routeProvider){
	$routeProvider
		//the timeline display
		.when('/', {
			templateUrl: 'main.html',
			controller: 'mainController'
		})
		//the new post display
		.when('/newPost', {
			templateUrl: 'newPost.html',
			controller: 'mainController'
		})
		.when('/profile', {
			templateUrl: 'profile.html',
			controller: 'mainController'
		})
		//the login display
		.when('/login', {
			templateUrl: 'login.html',
			controller: 'authController'
		})
		//the signup display
		.when('/register', {
			templateUrl: 'register.html',
			controller: 'authController'
		});
});

app.factory('postService', function($resource){
	return $resource('/api/posts/:id', null, 
    {
        'update': { method:'PUT' }
    });
});

app.controller('mainController', function(postService, $scope, $rootScope){
	$scope.posts = postService.query();
	$scope.newPost = {created_by: '', title: '', description: '', upvotes: 0, created_at: ''};
	
	$scope.post = function() {
	  $scope.newPost.created_by = $rootScope.current_user;
	  $scope.newPost.created_at = Date.now();
	  postService.save($scope.newPost, function(){
	    $scope.posts = postService.query();
	    $scope.newPost = {created_by: '', title: '', description: '', upvotes: 0, created_at: ''};
	  });
	};

	$scope.incrementUpvotes = function(post) {
		postService.get({id:post._id}, function(p) {
			p.$update({id: p._id}, function() {
				$scope.posts = postService.query();
			});
		});
	};
});

app.controller('authController', function($scope, $http, $rootScope, $location){
  $scope.user = {username: '', password: ''};
  $scope.error_message = '';

  $scope.login = function(){
    $http.post('/auth/login', $scope.user).success(function(data){
      if(data.state == 'success'){
        $rootScope.authenticated = true;
        $rootScope.current_user = data.user.username;
        $location.path('/');
      }
      else{
        $scope.error_message = data.message;
      }
    });
  };

  $scope.register = function(){
    $http.post('/auth/signup', $scope.user).success(function(data){
      if(data.state == 'success'){
        $rootScope.authenticated = true;
        $rootScope.current_user = data.user.username;
        $location.path('/');
      }
      else{
        $scope.error_message = data.message;
      }
    });
  };
});