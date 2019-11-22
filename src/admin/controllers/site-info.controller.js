/**
 * siteInfoController
 */
angular.module('controllers').controller('siteInfo', ['$scope', '$http', 'account','notification',function ($scope, $http, account,notification) {
    'use strict';
    /**
     * 初始化变量
     */
    $scope.disable_form = true;
    $scope.editAuth = false;
    $scope.readAuth = false;
    $scope.themes = [];
   
    $scope.title = '';
    $scope.keywords = '';
    $scope.description = '';
    $scope.theme = '';

    $scope.codeHeader = '';
    $scope.codeFooter = '';
    /**
     * 读取用户编辑权限以及返回读取当前单页
     */
    account.auths().then(function (auths) {
        $scope.editAuth = auths.siteInfo.edit;
        $scope.readAuth = auths.siteInfo.read;
    }, function () {
        notification.tip({
          	type: 'danger',
         	message: '读取权限失败'
        });
    });
    /**
     * 获取网站配置
     */
    $http.get('/api/site-info').then(function (res) {
        $scope.disable_form = false;
        $scope.themes = res.data.themes;
        
        $scope.title = res.data.siteInfo.title;
        $scope.keywords = res.data.siteInfo.keywords;
        $scope.description = res.data.siteInfo.description;
        $scope.theme = res.data.siteInfo.theme || 'default';

        $scope.codeHeader = res.data.siteInfo.codeHeader;
        $scope.codeFooter = res.data.siteInfo.codeFooter;
        
    },function () {
        notification.tip({
          	type: 'danger',
          	message: '获取网站配置失败'
        });
    });
    /**
     * 更新网站配置
     */
    $scope.submitSiteInfo = function () {
      	$scope.disable_form = true;
		$http.put('/api/site-info', {
			title: $scope.title,
			keywords: $scope.keywords,
			description: $scope.description,
			theme: $scope.theme,
			codeHeader: $scope.codeHeader,
			codeFooter: $scope.codeFooter
		}).then(function (res) {
        	$scope.disable_form = false;
			notification.tip({
				type: 'success',
				message: '网站配置已保存'
			});
      	},function () {
        	$scope.disable_form = false;
        	notification.tip({
          		type: 'danger',
          		message: '网站配置保存失败'
        	});
      	});
    };
}]);