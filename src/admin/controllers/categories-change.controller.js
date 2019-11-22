/**
 * Categories Change Controller
 */
angular.module('controllers').controller('categoriesChange', ['$scope', '$state', '$stateParams', '$http','notification',function ($scope, $state, $stateParams, $http,notification) {
    'use strict';
    /**
     * 初始化变量
     */
	$scope.disable_form = true;
	$scope._id = $stateParams.category ? $stateParams.category : 'null';
    $scope.action = 'create';
	$scope.types = [
		{ type: 'channel',name: '频道'}, 
		{ type: 'column',name: '栏目'}, 
		{ type: 'page',name: '单页'}, 
		{ type: 'link',name: '链接'}
	];
    $scope.models = [];
	$scope.viewfiles = [];
	
    $scope.type = 'column';
	$scope.name = '';
	$scope.sort = 0;
	$scope.isShow = true;
	$scope.model = '';
	$scope.prePath = '';
	$scope.oldPath = '';
    $scope.directory = '';
	$scope.pageSize = 15;
	$scope.views = {
		layout: '',
		channel: '',
		column: '',
		content: '',
		page: ''
	};
	$scope.isEdit = true;
    $scope.url = '';
    $scope.keywords =  '';
    $scope.description = '';
    /**
     * 读取内容模型
     */
    $http.get('/api/models', {params: {type: 'content'}}).then(function (res) {
      	$scope.models = res.data;
    }, function () {
		notification.tip({
			type: 'danger',
			message: '读取内容模型失败'
		});
    });
    /**
     * 读取模板列表
	 */
    async.parallel({
		viewfiles: function (callback) {
			$http.get('/api/views').then(function (res) {
				callback(null, res.data);
			}, function (res) {
				callback(res.data);
			});
		},
		category: function (callback) {
			if ($stateParams.category) {
				$scope.action = 'update';
				$http.get('/api/categories/' + $stateParams.category).then(function (res) {
					var data = res.data;
					if (data) {
						callback(null, data)
					} else {
						$state.go('main.categories');
					}
				}, function (res) {
					callback(res.data);
				});
			} else {
				callback(null);
			}
		}
    }, function (err, results) {
		if (err) {
			notification.tip({
				type: 'danger',
				message: '获取分类失败'
			});
			$scope.disable_form = true;
			return false;
		}
		// 获取模板文件名称数组，并设置默认显示的模板名称
		$scope.viewfiles = results.viewfiles;
		$scope.views.layout = 'layout-default';
		$scope.views.channel = 'channel-default';
		$scope.views.column = 'column-default';
		$scope.views.content = 'content-default';
		$scope.views.page = 'page-default';
		// 获取分类信息
      	if (results.category) {
        	$scope.type = results.category.type;
			$scope.name = results.category.name;
			$scope.sort = results.category.sort;
			$scope.isShow = results.category.isShow;

			$scope.model = results.category.model && results.category.model._id || '';
			// 根据当前分类的路径名称，截取出上级分类的path
			// 目的是使用截取出的上级path，可以和最新更改的directory目录名，拼接出最新的路径
			if ($scope.type === 'link') {
				// /zongyi/
				$scope.oldPath = angular.copy(results.category.mixed.prePath);
				// ["/zongyi", index: 0, input: "/zongyi/"]
				var regexPath = /^\/[A-z0-9\_\-\/]+(?=[\/])/.exec(results.category.mixed.prePath);
				$scope.prePath = regexPath ? regexPath[0] : '';
			} else {
				// /movie/action
				$scope.oldPath = angular.copy(results.category.path);
				// ["/movie", index: 0, input: "/movie/action"]
				var regexPath = /^\/[A-z0-9\_\-\/]+(?=[\/])/.exec(results.category.path);
				$scope.prePath = regexPath ? regexPath[0] : '';
			}
        	$scope.directory = /[A-z0-9\_\-]+$/.exec(results.category.path)[0];
			if (results.category.views) {
				$scope.views.layout = results.category.views.layout || 'layout-default';
				$scope.views.channel = results.category.views.channel || 'channel-default';
				$scope.views.column = results.category.views.column || 'column-default';
				$scope.views.content = results.category.views.content || 'content-default';
				$scope.views.page = results.category.views.page || 'page-default';
			}
        	$scope.keywords = results.category.keywords || '';
			$scope.description = results.category.description || '';
			if (results.category.mixed) {
				$scope.pageSize = results.category.mixed.pageSize;
				$scope.url = results.category.mixed.url || '';
          		$scope.isEdit = !_.isEmpty(results.category.mixed) ? results.category.mixed.isEdit : true;
			}
      	}
      	$scope.disable_form = false;
    });
    /**
     * 保存分类
     */
    $scope.saveCategory = function () {
		$scope.disable_form = true;
		var category = {
			type: $scope.type,
			name: $scope.name,
			isShow: $scope.isShow,
			sort: $scope.sort
		};
		switch ($scope.type) {
			case 'channel':
				category.path = '/' + $scope.directory.toLowerCase();
				category['views.layout'] = $scope.views.layout;
				category['views.channel'] = $scope.views.channel;
				category.keywords = $scope.keywords;
				category.description = $scope.description;
			break;
			case 'column':
				category.model = $scope.model;
				if ($scope.prePath) {
					category.path = $scope.prePath + '/' + $scope.directory.toLowerCase();
				} else {
					category.path = '/' + $scope.directory.toLowerCase();
				}
				category['mixed.pageSize'] = $scope.pageSize;
				category['views.layout'] = $scope.views.layout;
				category['views.column'] = $scope.views.column;
				category['views.content'] = $scope.views.content;
				category.keywords = $scope.keywords;
				category.description = $scope.description;
			break;
			case 'page':
				if ($scope.prePath) {
					category.path = $scope.prePath + '/' + $scope.directory.toLowerCase();
				} else {
					category.path = '/' + $scope.directory.toLowerCase();
				}
				category['views.layout'] = $scope.views.layout;
				category['views.page'] = $scope.views.page;
				category['mixed.isEdit'] = $scope.isEdit;
				category.keywords = $scope.keywords;
				category.description = $scope.description;
			break;
			case 'link':
				if ($scope.prePath) {
					category['mixed.prePath'] = $scope.prePath + '/';
				} else {
					category['mixed.prePath'] = '/';
				}
				category['mixed.url'] = $scope.url;
			break;
		}
		if ($stateParams._id) {
			category._id = $stateParams.category;
			$http.put('/api/categories/' + $stateParams.category, category).then(function (res) {
				notification.tip({
					type: 'success',
					message: '修改分类成功'
				});
				$scope.$emit('mainCategoriesUpdate');
				$state.go('main.categories', null, { reload: 'main.categories' });
			}, function () {
				notification.tip({
					type: 'danger',
					message: '修改分类失败'
				});
			});
		} else {
			$http.post('/api/categories', category).then(function (res) {
				notification.tip({
					type: 'success',
					message: '新增分类成功'
				});
				$scope.$emit('mainCategoriesUpdate');
				$state.go('main.categories', null, { reload: 'main.categories' });
			}, function () {
				notification.tip({
					type: 'danger',
					message: '新增分类失败'
				});
			});
      	}
    };
}]);