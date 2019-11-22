/**
 * Media Controller
 */
angular.module('controllers').controller('media', ['$scope','$http','account','notification',function ($scope,$http,account,notification) {
    'use strict';
    /**
     * 初始化变量
     */
	$scope.disable_form = false;
	$scope.editAuth = false;
    $scope.media = [];
    $scope.pageInfo = {
		currentPage:1,
		pageSize:10,
		totalPages:0
	};
    /**
     * 读取用户编辑权限以及返回读取当前单页
     */
    account.auths().then(function (auths) {
        $scope.editAuth = auths.media.edit;
    }, function () {
        notification.tip({
          	type: 'danger',
          	message: '读取权限失败'
        });
    });
    /**
     * 读取媒体列表
     */
    $scope.loadMedia = function () {
      	$http.get('/api/media',{params:{currentPage:$scope.pageInfo.currentPage,pageSize:$scope.pageInfo.pageSize}}).then(function (res) {
			var data = res.data;
			_.map(data.media, function (medium) {
				var fileNameLast = _.get(medium.fileName.match(/^.+\.(\w+)$/), 1);
				medium.fileNameLast = fileNameLast;
				medium.isImage = false;
				switch (fileNameLast) {
					case 'jpg':
					case 'jpeg':
					case 'png':
					case 'gif':
						medium.isImage = true;
				}
			});
			$scope.media = data.media;
			$scope.pageInfo.totalPages = data.pages;
			  if($scope.media.length==0&&$scope.pageInfo.totalPages>=1){
				$scope.pageInfo.currentPage--;
			}
			$scope.$emit('recalNiceScroll');
        });
	}; 
	$scope.loadMedia();
	/**
     * 监控页数的改变，重新读取当前栏目内容
     */
    $scope.$watch('pageInfo.currentPage', function (newValue,oldValue) {
		if(newValue===oldValue||oldValue==null) return;
      	$scope.loadMedia();
	},true);
	/**
     * 监控条数的改变，重新读取当前栏目内容
     */
    $scope.$watch('pageInfo.pageSize', function (newValue,oldValue) {
		if(newValue===oldValue||oldValue==null) return;
		$scope.loadMedia();
  	},true);
    /**
     * 删除媒体
     */
    $scope.deleteMedium = function (id) {
		$scope.disable_form = true;
		notification.confirm({
			icon:'fa-trash-o txt-color-orangeDark',
			title:'删除媒体',
			message:'您确定要删除此条媒体吗？',
			callback:function(){
				$http.delete('/api/media/' + id).then(function (res) {
					$scope.loadMedia();
					$scope.disable_form = false;
					notification.tip({
						type: 'success',
						message: '删除媒体成功'
					});
				}, function () {
					notification.tip({
						type: 'danger',
						message: '删除媒体失败'
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
     * 删除本页媒体
     */
	$scope.deleteListContent = function () {
		alert('此接口尚未添加，敬请期待！')
		// $scope.disable_form = true;
		// notification.confirm({
		// 	icon:'fa-trash-o txt-color-orangeDark',
		// 	title:'删除媒体',
		// 	message:'您确定要彻底删除本页媒体？删除后不可以再次恢复！',
		// 	callback:function(){
		// 		$http.delete('/api/media', { params: { ids: _.map($scope.media, '_id') } }).then(function () {
		// 			$scope.loadMedia();
		// 			$scope.disable_form = false;
		// 			notification.tip({
		// 				type: 'success',
		// 				message: '删除媒体成功'
		// 			});
		// 		}, function () {
		// 			notification.tip({
		// 				type: 'danger',
		// 				message: '删除媒体失败'
		// 			});
		// 		});
		// 	},
		// 	cancel:function(){
		// 		$scope.$apply(function(){
		// 			$scope.disable_form = false;
		// 		});
		// 	}
		// });
    };
}]);