/**
 * Content Models Controller
 */
angular.module('controllers').controller('contentModels', ['$scope', '$http', 'account','notification',function ($scope, $http, account,notification) {
    'use strict';
    /**
     * 初始化变量
     */
    $scope.disable_form = false;
    $scope.pending=true;
	$scope.editAuth = false;
    $scope.systemKey = [
		{name: 'thumbnail',value: '缩略图'},
		{name: 'abstract',value: '摘要'},
		{name: 'content',value: '内容'},
		{name: 'tags',value: '标签'}
    ];
    $scope.models = [];
    /**
     * 读取用户编辑权限
     */
    account.auths().then(function (auths) {
        $scope.editAuth = auths.contentModels.edit;
    }, function () {
        notification.tip({
          	type: 'danger',
          	message: '读取权限失败'
        });
    });
    /**
     * 读取内容模型列表
     */
    $http.get('/api/models', {params: {type: 'content'}}).then(function (res) {
        $scope.models = res.data;
        $scope.pending=false;
    }, function () {
		notification.tip({
			type: 'danger',
			message: '读取内容模型失败'
        });
        $scope.pending=false;
    });
    /**
     * 删除内容模型
     */
    $scope.deleteModel = function (id) {
		$scope.disable_form = true;
		notification.confirm({
            icon:'fa-trash-o txt-color-orangeDark',
            title:'删除模型',
            message:'您确定要删除该模型吗？',
            callback:function(){
				$http.delete('/api/models/' + id).then(function (res) {
					for (var i = 0; i < $scope.models.length; i++) {
						if (id === $scope.models[i]._id) {
							$scope.models.splice(i, 1);
							$scope.disable_form = false;
							return notification.tip({
								type: 'success',
								message: '删除内容模型成功'
							});
						}
					}
				}, function () {
					notification.tip({
						type: 'danger',
						message: '删除内容模型失败'
					});
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