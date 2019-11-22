/**
 * Page Change Controller
 */
angular.module('controllers').controller('pageChange', ['$scope', '$state', '$stateParams', '$http', 'account', '$sce','notification',function ($scope, $state, $stateParams, $http, account, $sce,notification) {
    'use strict';
    /**
     * 初始化变量
     */
	$scope.disable_form = true;
	
	$scope._id = $stateParams.page;
    $scope.name = '';
    $scope.pageContent = '';
	$scope.pageMedia = [];
	
    $scope.editAuth = false;
	$scope.readAuth = false;
	/**
	 * 计算编辑器高度
	 */
	$scope.height=$('#main').height()-13-43-15-13;
	$(window).on('resize',function(){
		$scope.$apply(function(){
			$scope.height=$('#main').height()-13-43-15-13;
		});
	})
    /**
     * 读取用户编辑权限以及返回读取当前单页
     */
    var getAuthAndGetPage = account.auths().then(function (auths) {
        $scope.editAuth = auths.pages.edit;
		$scope.readAuth = auths.pages.read;
        if ($scope.readAuth && !$scope.editAuth) {
          	return $http.get('/api/pages/' + $stateParams.page);
        } else if ( $scope.editAuth) {
          	return $http.get('/api/pages/' + $stateParams.page, { params: { markdown: true } });
        }
    }, function () {
        notification.tip({
          	type: 'danger',
          	message: '读取权限失败'
        });
    });
    /**
     * 读取当前单页
     */
    if ($stateParams.page) {
      	getAuthAndGetPage.then(function (res) {
          	var data = res.data;
          	if (data) {
				$scope.name = data.name;
				if ($scope.editAuth) {
					$scope.pageContent = data.pageContent;
				} else if ($scope.readAuth) {
					// 几种绑定方式的对比:
					// (1)ng-bind-html和内置的$sanitize服务
					// $sanitize会自动对html标签进行净化，并会把标签的属性以及绑定在元素上的事件都移除，仅保留了标签和内容。
					// 需要引入angular-sanitize.js
					// (2)ng-bind-html和$sce.trustAsHtml()
					// 它不再经过sanitize服务的净化，直接作为元素的.html()绑定给元素,保留所有的属性和事件，
					// 这一行的内容不依赖于ngSanitize模块,$sce服务是内置的。
					// (3)ng-bind
					// 绑定的值就作为字符串填充到元素里。
					$scope.pageContent = $sce.trustAsHtml(data.pageContent);
				}
				if (!_.isEmpty(data.pageMedia)) {
					_.forEach(data.pageMedia, function (medium) {
						var fileNameLast = _.get(medium.fileName.match(/^.+\.(\w+)$/), 1);
						var _medium = {
							file: null,
							fileName: medium.fileName,
							fileNameLast: fileNameLast,
							isImage: false,
							description: medium.description,
							src: medium.src,
							_id: medium._id,
							uploadStatus: 'success',
							active: false,
							edited: false
						};
						switch (fileNameLast) {
							case 'jpg':
							case 'jpeg':
							case 'png':
							case 'gif':
								_medium.isImage = true;
						}
						$scope.pageMedia.push(_medium);
					});
				}
            	$scope.disable_form = false;
			} else {
				$scope.disable_form = true;
			}
        }, function () {
			notification.tip({
				type: 'danger',
				message: '读取内容失败'
		  	});
        });
    }
    /**
     * 保存当前内容
     */
    $scope.savePage = function () {
      	$scope.disable_form = true;
		var data = {
			pageContent: $scope.pageContent
		};
		if (!_.isEmpty($scope.pageMedia)) {
			data.pageMedia = _.map($scope.pageMedia, '_id');
		}
		$http.put('/api/pages/' + $stateParams.page, data).then(function (res) {
			console.log(res)
			$scope.disable_form = false;
			notification.tip({
				type: 'success',
				message: '更新单页成功'
			});
			$state.go('main.pages', { page: $stateParams.page }, { reload: 'main.pages' });
		}, function () {
			notification.tip({
				type: 'danger',
				message: '更新单页失败'
			});
		});
	};
}]);