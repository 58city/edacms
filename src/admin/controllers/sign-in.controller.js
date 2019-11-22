/**
 * Sign In Controller
 */
angular.module('controllers').controller('signIn', ['$scope', '$timeout', '$state', '$http', '$window', function ($scope, $timeout, $state, $http, $window) {
	'use strict';

	$scope.disable_form = false;
	$scope.email = '';
	$scope.password = '';
	$scope.autoSignIn = false;
	$scope.wrongEmailOrPassword = false;
	function resetEmailAndPassword() {
		$scope.wrongEmailOrPassword = false;
	}

	$scope.$watch('email', resetEmailAndPassword);
	$scope.$watch('password', resetEmailAndPassword);

	$scope.signIn = function () {
		$scope.disable_form = true;
		$http.put('/api/account/sign-in', {
			email: $scope.email,
			password: $scope.password,
			autoSignIn: $scope.autoSignIn
		}).then(function (res) {
			$state.go('main', {}, { reload: true });
		}, function (res) {
			$scope.wrongEmailOrPassword = true;
			$scope.animateShake = true;
			$timeout(function () {
				$scope.animateShake = false;
				$scope.disable_form = false;
			}, 600);
		});
	};
}]);