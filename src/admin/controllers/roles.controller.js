/**
 * Roles Controller
 */
angular.module('controllers').controller('roles', ['$scope', '$http', 'account','notification',function ($scope, $http, account, notification) {
    'use strict';
    /**
     * 初始化变量
     */
    $scope.editAuth = true;
    $scope.disable_form = false;
    $scope.roles = [];
    /**
     * 读取用户编辑权限以及返回读取当前单页
     */
    account.auths().then(function (auths) {
        $scope.editAuth = auths.roles.edit;
    }, function () {
        notification.tip({
          	type: 'danger',
          	message: '读取权限失败'
        });
    });
    /**
     * 获取角色列表，过滤掉authorities==100000
	 * _.reject()：_.filter的反向方法
     */
    $http.get('/api/roles').then(function (res) {
        var data = _.reject(res.data, function (authority) {
			var admin = _.find(authority.authorities, function (authority) {
				return authority === 100000;
			});
			return admin;
        });
        $scope.roles = data;
    }, function () {
        notification.tip({
          	type: 'danger',
          	message: '获取角色列表失败'
        });
    });
    /**
     * 删除角色
	 * _.pullAllBy(要修改的数组,要移除值的数组,迭代器):
     */
    $scope.deleteRole = function (id) {
          $scope.disable_form = true;
          notification.confirm({
			icon:'fa-trash-o txt-color-orangeDark',
			title:'删除角色',
			message:'您确定要删除此角色吗？',
			callback:function(){
                $http.delete('/api/roles/' + id).then(function (res) {
                    console.log(res)
                    _.pullAllBy($scope.roles, [{ _id: id } ], '_id');
                    notification.tip({
                        type: 'success',
                        message: '删除角色成功'
                    });
                    $scope.disable_form = false;
                },function () {
                    notification.tip({
                        type: 'danger',
                        message: '删除角色失败'
                    });
                    $scope.disable_form = false;
                });
			},
			cancel:function(){
				$scope.$apply(function(){
					$scope.disable_form = false;
				});
			}
		});
    };
}]);