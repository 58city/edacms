/**
 * Trash Controller
 */
angular.module('controllers').controller('trash', ['$scope', '$http', 'account','notification',function ($scope, $http, account,notification) {
    'use strict';
    /**
     * 初始化变量
     */
    $scope.disable_form = false;
	$scope.contents = [];
	$scope.pageInfo = {
		currentPage:1,
		pageSize:10,
		totalPages:0
	};
    $scope.statusType = [
		{
			name: '草稿',
			value: 'draft'
		},
		{
			name: '已发布',
			value: 'pushed'
		}
    ];
    $scope.editAuth = false;
    /**
     * 读取用户编辑权限
     */
    account.auths().then(function (auths) {
        $scope.editAuth = auths.contents.edit;
    }, function () {
        $scope.$emit('notification', {
          	type: 'danger',
          	message: '读取权限失败'
        });
    });
    /**
     * 读取内容列表
     */
    $scope.loadTrashContents = function () {
		$http.get('/api/contents', { 
			params:{deleted:true,currentPage:$scope.pageInfo.currentPage,pageSize:$scope.pageInfo.pageSize}
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
	$scope.loadTrashContents();
    /**
     * 监控页数的改变，重新读取当前栏目内容
     */
    $scope.$watch('pageInfo.currentPage', function (newValue,oldValue) {
		if(newValue===oldValue||oldValue==null) return;
      	$scope.loadTrashContents();
	},true);
	/**
     * 监控条数的改变，重新读取当前栏目内容
     */
    $scope.$watch('pageInfo.pageSize', function (newValue,oldValue) {
		if(newValue===oldValue||oldValue==null) return;
		$scope.loadTrashContents();
  	},true);
    /**
     * 恢复内容
     */
    $scope.recoveryContent = function (id) {
		$scope.disable_form = true;
		var data = {
			deleted: false,
			part: true
		};
		notification.confirm({
			icon:'fa-history txt-color-orangeDark',
			title:'恢复',
			message:'您确定要恢复此条内容吗？',
			callback:function(){
				$http.put('/api/contents/' + id, data).then(function () {
					$scope.loadTrashContents();
				  	$scope.disable_form = false;
				  	notification.tip({
						type: 'success',
						message: '恢复内容成功'
					});
			  	}, function () {
					notification.tip({
						type: 'danger',
						message: '恢复内容失败'
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
    /**
     * 删除内容
     */
    $scope.deleteContent = function (id) {
		$scope.disable_form = true;
		notification.confirm({
			icon:'fa-trash-o txt-color-orangeDark',
			title:'彻底删除',
			message:'您确定要彻底删除此条内容吗？删除后不可以再次恢复！',
			callback:function(){
				$http.delete('/api/contents/' + id).then(function (res) {
					$scope.loadTrashContents();
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
    /**
     * 删除当前页内容
     */
    $scope.deleteListContent = function () {
		$scope.disable_form = true;
		notification.confirm({
			icon:'fa-trash-o txt-color-orangeDark',
			title:'彻底删除',
			message:'您确定要彻底删除本页内容？删除后不可以再次恢复！',
			callback:function(){
				$http.delete('/api/contents', { params: { ids: _.map($scope.contents, '_id') } }).then(function (res) {
					$scope.loadTrashContents();
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