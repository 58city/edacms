/**
 * Roles Change Controller
 */
angular.module('controllers').controller('rolesChange', ['$scope', '$state', '$stateParams', '$http', 'notification', function ($scope, $state, $stateParams, $http, notification) {
	'use strict';
	/**
	 * 初始化变量
	 */
	$scope.disable_form = false;
	$scope.action = 'create';

	$scope.name = '';
	$scope.description = '';
	$scope.authorities = [];
	/**
	 * 获取权限列表和当前角色
	 */
	async.parallel({
		// 获取权限列表
		authorities: function (callback) {
			$http.get('/api/authorities').then(function (res) {
				var data = _.reject(res.data, { code: 100000 });
				callback(null, data);
			}, function () {
				callback('获取权限失败');
			});
		},
		// 获取当前角色
		role: function (callback) {
			if ($stateParams._id) {
				$scope.action = 'update';
				$http.get('/api/roles/' + $stateParams._id).then(function (res) {
					var data = res.data;
					callback(null, data);
				}, function () {
					callback('获取角色失败');
				});
			} else {
				callback(null);
			}
		}
	}, function (err, results) {
		if (err) {
			notification.tip({
				type: 'danger',
				message: err
			});
			return false;
		}
		// 给权限列表添加select属性，默认为0，表示无权限
		$scope.authorities = _.map(results.authorities, function (authority) {
			authority.select = 0;
			return authority;
		});
		if (results.role) {
			$scope.name = results.role.name;
			$scope.description = results.role.description;
			// 遍历所有权限列表
			_.forEach($scope.authorities, function (authority) {
				authority.select = 0;
				// 读取当前遍历到的权限列表项的read和edit的编码
				var read = _.find(authority.authorities, { name: 'read' }).code;
				var edit = _.find(authority.authorities, { name: 'edit' }).code;
				// 查找当前角色所拥有的权限编码，是否包含当前遍历到的权限列表项的read和edit的编码
				var roleRead = _.find(results.role.authorities, function (authority) {
					return authority === read;
				});
				var roleEdit = _.find(results.role.authorities, function (authority) {
					return authority === edit;
				});
				// 如果当前角色所拥有的权限编码，同时包含当前遍历到的权限列表项的read和edit的编码
				// 则把当前权限列表项的select设置为2
				// 如果当前角色所拥有的权限编码，只包含当前遍历到的权限列表项的read的编码
				// 则把当前权限列表项的select设置为1
				// 否则为无权限，select的值为0
				if (roleRead && roleEdit) {
					authority.select = 2;
				} else if (roleRead) {
					authority.select = 1;
				}
			});
		}
	});
	/**
	 * 保存角色
	 */
	$scope.saveRole = function () {
		$scope.disable_form = true;
		var role = {
			name: $scope.name,
			description: $scope.description,
			authorities: []
		};
		_.forEach($scope.authorities, function (authority) {
			switch (authority.select) {
				case 0:
					break;
				case 1:
					_.forEach(authority.authorities, function (authority) {
						if (authority.name === 'read') role.authorities.push(authority.code);
					});
					break;
				case 2:
					_.forEach(authority.authorities, function (authority) {
						if (authority.name === 'read') role.authorities.push(authority.code);
						if (authority.name === 'edit') role.authorities.push(authority.code);
					});
					break;
			}
		});
		if ($stateParams._id) {
			$http.put('/api/roles/' + $stateParams._id, role).then(function (res) {
				notification.tip({
					type: 'success',
					message: '修改角色成功'
				});
				$scope.$emit('mainUserUpdate');
				$state.go('main.roles', null, { reload: 'main.roles' });
			}, function () {
				notification.tip({
					type: 'danger',
					message: '修改角色失败'
				});
			});
		} else {
			$http.post('/api/roles', role).then(function (res) {
				notification.tip({
					type: 'success',
					message: '新增角色成功'
				});
				$scope.$emit('mainUserUpdate');
				$state.go('main.roles', null, { reload: 'main.roles' });
			}, function () {
				notification.tip({
					type: 'danger',
					message: '新增角色失败'
				});
			});
		}
	};
}]);