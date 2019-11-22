/**
 * Admin Users Change Controller
 */
angular.module('controllers').controller('adminUsersChange', ['$scope', '$state', '$stateParams', '$http', 'notification', function ($scope, $state, $stateParams, $http, notification) {
    'use strict';
    /**
     * 初始化变量
     */
    $scope.disable_form = false;
    $scope.action = 'create';
    $scope.checkEmailing = false;
	$scope.inputing = false;
	
	$scope.roleList = [];
    $scope.email = '';
    $scope.oldEmail = '';
    $scope.nickname = '';
    $scope.password = '';
    $scope.confirmpwd = '';
    $scope.roleId = '';
    /**
     * 读取角色与用户
     */
    async.parallel({
      	// 获取角色列表
		roles: function (callback) {
			$http.get('/api/roles').then(function (res) {
				var data = res.data;
				var normalRoles= _.reject(data, function (role) {
					return _.find(role.authorities, function (authority) {
						return authority === 100000;
					});
				});
				callback(null, normalRoles);
			}, function () {
				callback('获取角色列表失败');
			});
		},
		// 获取当前用户
		user: function (callback) {
			if ($stateParams._id) {
				$scope.action = 'update';
				$http.get('/api/admin-users/' + $stateParams._id).then(function (res) {
					callback(null, res.data);
				}, function () {
					callback('获取用户失败');
				})
			} else {
				callback(null);
			}
		}
    }, function (err, results) {
		if (err) {
			return notification.tip({
				type: 'danger',
				message: err
			});
		}
      	$scope.roleList = results.roles;
		if ($stateParams._id && results.user) {
			$scope.oldEmail = angular.copy(results.user.email);
			$scope.email = results.user.email;
			$scope.nickname = results.user.nickname;
			$scope.roleId = results.user.role._id;
		} else if ($stateParams._id) {
			$state.go('main.adminUsers');
		}
    });
    /**
     * 保存用户
     */
    $scope.saveUser = function () {
      	$scope.disable_form = true;
		var user = {
			email: $scope.email.toLowerCase(),
			nickname: $scope.nickname,
			role: $scope.roleId
		};
      	if ($scope.password) user.password = $scope.password;
      	if ($stateParams._id) {
			user._id=$stateParams._id;
			$http.put('/api/admin-users/' + $stateParams._id, user).then(function (res) {
				notification.tip({
					type: 'success',
					message: '修改用户成功'
				});
				$scope.$emit('mainUserUpdate');
				$state.go('main.adminUsers', null, { reload: 'main.adminUsers' });
			}, function () {
				notification.tip({
					type: 'danger',
					message: '修改用户失败'
				});
			});
      	} else {
			$http.post('/api/admin-users', user).then(function (res) {
				notification.tip({
					type: 'success',
					message: '创建用户成功'
				});
				$scope.$emit('mainUserUpdate');
				$state.go('main.adminUsers', null, { reload: 'main.adminUsers' });
			}, function () {
				notification.tip({
					type: 'danger',
					message: '创建用户失败'
				});
			});
      	}
    };
}]);