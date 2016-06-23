var underscore = angular.module('underscore', []);
underscore.factory('_', ['$window', function($window) {
  return $window._; 
}]);

var chatApp = angular.module('chatApp', ['ngRoute', 'underscore']);

chatApp.config(function($routeProvider){

});

chatApp.controller('chatController', function($scope, $http, $interval, _){

	//Get all users
	$http.get('/users')
		.success(function(users){
			$scope.users = users;

		  	//Log current user in and set the details
		  	if(!$scope.currentUser){
		  		$scope.currentUser = $scope.users[2];
		  		$scope.currentUser.status = true;
		  		$scope.inputMessageText = '';
		  	}
		});

  	//Initialise chat, may be load previous messages
	$scope.messages = [];
	$http.get('/messages/0')
		.success(function(messages){
			$scope.messages = messages;
		});


	//Chat groups. This will need to be revised
	//$scope.chatGroups = [{id: 0, name: 'Welcome Chat', memberIds: [1, 2, 3, 4, 5]}];
	//$scope.currentChatGroup = $scope.chatGroups[0];
	$scope.currentChatGroup = '';

	$scope.switchUser = function(userId) {

		$scope.currentUser = _.find($scope.users, function(user){ 
			if(user._id == userId) {
				return user;
			}
		});

		$scope.currentUser.status = true;

		$http.put('/userStatusUpdate/' + $scope.currentUser._id);
	}

	$scope.switchChatGroup = function(userId, recipientId) {
		console.log(userId);
		console.log(recipientId);

		var postData = {
			memberIds: [userId, recipientId]
		};

		$http.post('/getGroupId/', postData)
            .success(function (data, status) {
                
            	console.log(data);
                //$scope.PostDataResponse = data;
            })
            .error(function (data, status) {
            	console.log("Unable to get group chat id");
            });
	}


	$scope.sendChat = function() {

		if($scope.inputMessageText != '') {

			var messageData = {	
					message: $scope.inputMessageText, 
					senderId: $scope.currentUser._id,
					senderName: $scope.currentUser.name, 
					chatGroupId: $scope.currentChatGroup.id, 
					timestamp: Date.now()
				};

			$scope.messages.push(messageData);

			$http.post('/messages/', messageData);

			$scope.inputMessageText = '';
		}
	}

	$interval(function(){
		checkUserStatus();
	}, 10000);

	$interval(function(){
		checkNewMessages();
	}, 3000);

	function checkUserStatus(){
		$http.get('/users')
		.success(function(users){
			$scope.users = users;
		});
	}

	function checkNewMessages(){
		if($scope.currentChatGroup != '') {
			$http.get('/messages/' + $scope.currentChatGroup)
			.success(function(messages){
				$scope.messages = messages;
			});
		}
	}

});