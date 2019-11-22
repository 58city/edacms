/**
 * Contents Controller
 */
angular.module('controllers').controller('contents', ['$scope', 'notification', '$stateParams', '$http', 'account',function ($scope, notification, $stateParams, $http, account) {
	'use strict';
    /**
     * 初始化变量
     */
    $scope.disable_form = false;
    $scope.category = {};
	$scope.contents = [];
	$scope.pageInfo = {
		currentPage:1,
		pageSize:10,
		totalPages:0
	};
    $scope.statusType = [{
        name: '草稿',
        value: 'draft'
    },{
        name: '已发布',
        value: 'pushed'
    }];
	$scope.editAuth = false;
    /**
     * 读取用户编辑权限
     */
    account.auths().then(function (auths) {
        $scope.editAuth = auths.contents.edit;
    }, function () {
		notification.tip({
          	type: 'danger',
          	message: '读取权限失败'
        });
    });
    /**
     * 读取当前栏目
     */
    $http.get('/api/categories/' + $stateParams.category).then(function (res) {
        $scope.category = res.data;
    });
    /**
     * 读取当前栏目内容
     */
    $scope.loadContents = function () {
		if(!$stateParams.category) return;
      	$http.get('/api/contents', { 
		  	params: { _id: $stateParams.category, deleted: false, currentPage: $scope.pageInfo.currentPage, pageSize: $scope.pageInfo.pageSize } 
		}).then(function (res) {
          	var data = res.data;
         	$scope.contents = data.contents;
			$scope.pageInfo.totalPages = data.pages;
			if($scope.contents.length==0&&$scope.pageInfo.totalPages>=1){
				$scope.pageInfo.currentPage--;
			}
			$scope.$emit('recalNiceScroll');  
        }, function () {
			notification.tip({
				type: 'danger',
				message: '读取内容列表失败'
			});
        });
	}; 
	$scope.loadContents();
    /**
     * 监控页数的改变，重新读取当前栏目内容
     */
    $scope.$watch('pageInfo.currentPage', function (newValue,oldValue) {
		if(newValue===oldValue||oldValue==null) return;
      	$scope.loadContents();
	},true);
	/**
     * 监控条数的改变，重新读取当前栏目内容
     */
    $scope.$watch('pageInfo.pageSize', function (newValue,oldValue) {
		if(newValue===oldValue||oldValue==null) return;
		$scope.loadContents();
  	},true);
    /**
     * 删除内容，重新读取当前栏目内容列表
     */
    $scope.deleteContent = function (id) {
		$scope.disable_form = true;
		notification.confirm({
			icon:'fa-trash-o txt-color-orangeDark',
			title:'删除内容',
			message:'您确定要删除此条内容吗？删除后可以在回收站再次恢复！',
			callback:function(){
				$http.delete('/api/contents/' + id).then(function (res) {
					$scope.loadContents();
					$scope.disable_form = false;
					notification.tip({
						type: 'success',
						message: '删除内容成功'
					});
				}, function () {
					notification.tip({
						type: 'danger',
						message: '删除内容失败'
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