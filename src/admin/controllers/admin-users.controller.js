/**
 * Admin Users Controller
 */
angular.module('controllers').controller('adminUsers', ['$scope', '$http', 'account','notification', function ($scope, $http, account,notification) {
    'use strict';
    /**
     * 初始化变量
     */
    $scope.editAuth = false;
    $scope.disable_form = false;
    $scope.users = [];    
    /**
     * 读取用户编辑权限以及返回读取当前单页
     */
    account.auths().then(function (auths) {
        $scope.editAuth = auths.adminUsers.edit;
    }, function () {
        notification.tip({
          	type: 'danger',
          	message: '读取权限失败'
        });
    });
    /**
     * 读取后台用户
     */
    $http.get('/api/admin-users').then(function (res) {
        var data = res.data;
        _.forEach(data, function (user) {
          	var isSupAdmin = _.find(_.get(user, 'role.authorities'), function (authority) {
            	return authority === 100000;
          	});
          	if (isSupAdmin) user.isSupAdmin = true;
        });
        $scope.users = res.data;
    }, function () {
        notification.tip({
          	type: 'danger',
          	message: '读取后台用户失败'
        });
    });
    /**
     * 删除后台用户
     */
    $scope.deleteUser = function (id) {
        $scope.disable_form = true;
        notification.confirm({
            icon:'fa-trash-o txt-color-orangeDark',
            title:'删除用户',
            message:'您确定要删除此用户吗？',
            callback:function(){
                $http.delete('/api/admin-users/' + id).then(function (res) {
                    for (var i = 0; i < $scope.users.length; i++) {
                        if (id === $scope.users[i]._id) {
                            $scope.users.splice(i, 1);
                            notification.tip({
                                type: 'success',
                                message: '删除用户成功'
                            });
                            $scope.disable_form = false;
                        }
                    }
                }, function () {
                      notification.tip({
                        type: 'danger',
                        message: '删除用户失败'
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