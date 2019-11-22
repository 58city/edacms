/**
 * Account Controller
 */
angular.module('controllers').controller('account', ['$scope','$http', 'account','notification',function ($scope, $http, account, notification) {
    'use strict';
    /**
     * 初始化变量
     */
    $scope.disable_form = true;
    $scope.editAuth = false;

    $scope.email = '';
    $scope.oldEmail = '';
    $scope.nickname = '';
    $scope.password = '';
    $scope.confirmpwd = '';
    $scope.role = '';
    /**
     * 读取用户编辑权限
     */
    account.auths().then(function (auths) {
        $scope.editAuth = auths.account.edit;
    }, function () {
        notification.tip({
          	type: 'danger',
          	message: '读取权限失败'
        });
    });
    /**
     * 获取当前用户信息
     */
    account.get().then(function (user) {
        $scope.disable_form = false;
        $scope.email = user.email;
        $scope.oldEmail = user.email;
        $scope.nickname = user.nickname;
        $scope.role = user.role;
    }, function () {
        notification.tip({
          	type: 'danger',
          	message: '帐号更新失败'
        });
    });
    /**
     * 更新个人信息
     */
    $scope.update = function () {
      	$scope.disable_form = true;
		var user = {
			nickname: $scope.nickname,
			email: $scope.email
		};
      	if ($scope.password) user.password = $scope.password;
		$http.put('/api/account', user).then(function (res) {
			account.reset();
			$scope.$emit('mainUserUpdate');
			notification.tip({
				type: 'success',
				message: '帐号更新成功'
            });
            $scope.disable_form = false;
		}, function () {
			notification.tip({
				type: 'danger',
				message: '帐号更新失败'
            });
            $scope.disable_form = false;
		});
	};
}]);