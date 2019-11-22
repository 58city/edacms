/**
 * I'm the King of the World!
 */
angular.module('nodercms', [
	'ngAnimate',
	'ipCookie',
	'ui.router',
	'ngFileUpload',
	'angular-img-cropper',
	'controllers',
	'services',
	'directives',
	'filters',
	'views'
])
	.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider', function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
		'use strict';
		// 修改默认请求头,向后台发送数据的格式必须为json字符串
		$httpProvider.defaults.headers.common = { 'content-type': 'application/json;charset=utf-8' };
		// 拦截器数组添加“拦截无权限请求”服务
		$httpProvider.interceptors.push('authorityInterceptor');
		// 开启 HTML5 模式,删除url路径中的哈希值
		$locationProvider.html5Mode(true);

		$urlRouterProvider.otherwise(function ($injector) {
			$injector.get('$state').go('main');
		});
		$stateProvider
			//安装
			.state('install', {
				url: '^/admin/install',
				controller: 'install',
				templateProvider: ['$templateCache', function ($templateCache) {
					return $templateCache.get('install.view.html');
				}],
				resolve: {
					checkInstallResolve: ['checkInstallResolve', function (resolve) {
						return resolve.leaveToSignInOrNone()
					}]
				}
			})
			// 登录
			.state('signIn', {
				cache: false,
				url: '^/admin/sign-in',
				controller: 'signIn',
				templateProvider: ['$templateCache', function ($templateCache) {
					return $templateCache.get('sign-in.view.html');
				}],
				resolve: {
					checkInstallResolve: ['checkInstallResolve', function (resolve) {
						return resolve.enterToInstallOrNone()
					}]
				}
			})
			// 控制面板
			.state('main', {
				cache: false,
				url: '^/admin',
				controller: 'main',
				templateProvider: ['$templateCache', function ($templateCache) {
					return $templateCache.get('main.view.html');
				}],
				resolve: {
					account: 'account'
				}
			})
			// 推荐管理--显示推荐/删除推荐
			.state('main.features', {
				url: '^/admin/features',
				controller: 'features',
				templateProvider: ['$templateCache', function ($templateCache) {
					return $templateCache.get('features.view.html');
				}],
				resolve: {
					checkAuth: ['checkAuthResolve', function (resolve) {
						return resolve('features', 'read')
					}]
				}
			})
			// 推荐管理--新增推荐
			.state('main.features.create', {
				url: '^/admin/features/:model/create',
				controller: 'featuresChange',
				templateProvider: ['$templateCache', function ($templateCache) {
					return $templateCache.get('features-change.view.html');
				}],
				resolve: {
					checkAuth: ['checkAuthResolve', function (resolve) {
						return resolve('features', 'edit')
					}]
				}
			})
			// 推荐管理--更新推荐
			.state('main.features.update', {
				url: '^/admin/features/:model/update/:feature',
				controller: 'featuresChange',
				templateProvider: ['$templateCache', function ($templateCache) {
					return $templateCache.get('features-change.view.html');
				}],
				resolve: {
					checkAuth: ['checkAuthResolve', function (resolve) {
						return resolve('features', 'edit')
					}]
				}
			})
			// 栏目列表--没有栏目
			.state('main.notFoundContents', {
				url: '^/admin/contents',
				templateProvider: ['$templateCache', function ($templateCache) {
					return $templateCache.get('not-fount-contents.view.html');
				}],
				resolve: {
					checkAuth: ['checkAuthResolve', function (resolve) {
						return resolve('contents', 'read')
					}]
				}
			})
			// 栏目列表--显示栏目内容
			.state('main.contents', {
				url: '^/admin/contents/:category',
				controller: 'contents',
				templateProvider: ['$templateCache', function ($templateCache) {
					return $templateCache.get('contents.view.html');
				}],
				resolve: {
					checkAuth: ['checkAuthResolve', function (resolve) {
						return resolve('contents', 'read')
					}]
				}
			})
			// 栏目列表 - 新建栏目内容
			.state('main.contents.create', {
				url: '^/admin/contents/:category/create',
				controller: 'contentChange',
				templateProvider: ['$templateCache', function ($templateCache) {
					return $templateCache.get('content-change.view.html');
				}],
				resolve: {
					checkAuth: ['checkAuthResolve', function (resolve) {
						return resolve('contents', 'edit')
					}]
				}
			})
			// 栏目列表 - 更新内容
			.state('main.contents.update', {
				url: '^/admin/contents/:category/update/:content',
				controller: 'contentChange',
				templateProvider: ['$templateCache', function ($templateCache) {
					return $templateCache.get('content-change.view.html');
				}],
				resolve: {
					checkAuth: ['checkAuthResolve', function (resolve) {
						return resolve('contents', 'edit')
					}]
				}
			})
			// 栏目列表 - 回收站
			.state('main.contents.trash', {
				/*
				 * 这里不能使用下面的url:
				 * url: '^/admin/contents/trash'
				 * 因为这个url和父路由main.contents的url类似（url: '^/admin/contents/:category'）。
				 * 当第一次加载此路由时，它的url会被main.contents识别，trash被当做:category参数，并调用main.contents的控制器。
				 * 
				 * 简而言之，加载子路由时，父路由不会重新加载执行，因为有缓存。
				 * 这里main.contents.trash加载时main.contents重新执行的原因是url冲突。
				 */
				url: '^/admin/contents_trash',
				controller: 'trash',
				templateProvider: ['$templateCache', function ($templateCache) {
					return $templateCache.get('trash.view.html');
				}],
				resolve: {
					checkAuth: ['checkAuthResolve', function (resolve) {
						return resolve('contents', 'read')
					}]
				}
			})
			// 单页列表--没有单页
			.state('main.notFoundPages', {
				url: '^/admin/pages',
				templateProvider: ['$templateCache', function ($templateCache) {
					return $templateCache.get('not-found-pages.view.html');
				}],
				resolve: {
					checkAuth: ['checkAuthResolve', function (resolve) {
						return resolve('pages', 'read')
					}]
				}
			})
			// 单页列表--单页内容
			.state('main.pages', {
				url: '^/admin/pages/:page',
				controller: 'pageChange',
				templateProvider: ['$templateCache', function ($templateCache) {
					return $templateCache.get('page-change.view.html');
				}],
				resolve: {
					checkAuth: ['checkAuthResolve', function (resolve) {
						return resolve('pages', 'read')
					}]
				}
			})
			// 媒体库
			.state('main.media', {
				url: '^/admin/media',
				controller: 'media',
				templateProvider: ['$templateCache', function ($templateCache) {
					return $templateCache.get('media.view.html');
				}],
				resolve: {
					checkAuth: ['checkAuthResolve', function (resolve) {
						return resolve('media', 'read')
					}]
				}
			})
			// 帐号设置
			.state('main.account', {
				url: '^/admin/account',
				controller: 'account',
				templateProvider: ['$templateCache', function ($templateCache) {
					return $templateCache.get('account.view.html');
				}],
				resolve: {
					checkAuth: ['checkAuthResolve', function (resolve) {
						return resolve('account', 'read')
					}]
				}
			})
			// 网站配置
			.state('main.siteInfo', {
				url: '^/admin/setting/site-info',
				controller: 'siteInfo',
				templateProvider: ['$templateCache', function ($templateCache) {
					return $templateCache.get('site-info.view.html');
				}],
				resolve: {
					checkAuth: ['checkAuthResolve', function (resolve) {
						return resolve('siteInfo', 'read')
					}]
				}
			})
			// 分类管理 - 显示分类
			.state('main.categories', {
				url: '^/admin/setting/categories',
				controller: 'categories',
				templateProvider: ['$templateCache', function ($templateCache) {
					return $templateCache.get('categories.view.html');
				}],
				resolve: {
					checkAuth: ['checkAuthResolve', function (resolve) {
						return resolve('categories', 'read')
					}]
				}
			})
			// 分类管理 - 创建分类
			.state('main.categories.create', {
				url: '^/admin/setting/categories/create',
				controller: 'categoriesChange',
				templateProvider: ['$templateCache', function ($templateCache) {
					return $templateCache.get('categories-change.view.html');
				}],
				resolve: {
					checkAuth: ['checkAuthResolve', function (resolve) {
						return resolve('categories', 'edit')
					}]
				}
			})
			// 分类管理 - 更新分类
			.state('main.categories.update', {
				url: '^/admin/setting/categories/update/:category',
				controller: 'categoriesChange',
				templateProvider: ['$templateCache', function ($templateCache) {
					return $templateCache.get('categories-change.view.html');
				}],
				resolve: {
					checkAuth: ['checkAuthResolve', function (resolve) {
						return resolve('categories', 'edit')
					}]
				}
			})
			// 内容模型 - 查询模型
			.state('main.contentModels', {
				url: '^/admin/setting/content-models',
				controller: 'contentModels',
				templateProvider: ['$templateCache', function ($templateCache) {
					return $templateCache.get('content-models.view.html');
				}],
				resolve: {
					checkAuth: ['checkAuthResolve', function (resolve) {
						return resolve('contentModels', 'read')
					}]
				}
			})
			// 内容模型 - 创建模型
			.state('main.contentModels.create', {
				url: '^/admin/setting/content-models/create',
				controller: 'contentModelChange',
				templateProvider: ['$templateCache', function ($templateCache) {
					return $templateCache.get('content-model-change.view.html');
				}],
				resolve: {
					checkAuth: ['checkAuthResolve', function (resolve) {
						return resolve('contentModels', 'edit')
					}]
				}
			})
			// 内容模型 - 更新模型
			.state('main.contentModels.update', {
				url: '^/admin/setting/content-models/update/:model',
				controller: 'contentModelChange',
				templateProvider: ['$templateCache', function ($templateCache) {
					return $templateCache.get('content-model-change.view.html');
				}],
				resolve: {
					checkAuth: ['checkAuthResolve', function (resolve) {
						return resolve('contentModels', 'edit')
					}]
				}
			})
			// 推荐位配置 - 显示推荐位
			.state('main.featureModels', {
				url: '^/admin/setting/feature-models',
				controller: 'featureModels',
				templateProvider: ['$templateCache', function ($templateCache) {
					return $templateCache.get('feature-models.view.html');
				}],
				resolve: {
					checkAuth: ['checkAuthResolve', function (resolve) {
						return resolve('featureModels', 'read')
					}]
				}
			})
			// 推荐位配置 - 新增推荐位
			.state('main.featureModels.create', {
				url: '^/admin/setting/feature-models/create',
				controller: 'featureModelChange',
				templateProvider: ['$templateCache', function ($templateCache) {
					return $templateCache.get('feature-model-change.view.html');
				}],
				resolve: {
					checkAuth: ['checkAuthResolve', function (resolve) {
						return resolve('featureModels', 'edit')
					}]
				}
			})
			// 推荐位配置 - 更新推荐位
			.state('main.featureModels.update', {
				url: '^/admin/setting/feature-models/update/:model',
				controller: 'featureModelChange',
				templateProvider: ['$templateCache', function ($templateCache) {
					return $templateCache.get('feature-model-change.view.html');
				}],
				resolve: {
					checkAuth: ['checkAuthResolve', function (resolve) {
						return resolve('featureModels', 'edit')
					}]
				}
			})
			// 角色权限 - 显示角色
			.state('main.roles', {
				url: '^/admin/setting/roles',
				controller: 'roles',
				templateProvider: ['$templateCache', function ($templateCache) {
					return $templateCache.get('roles.view.html');
				}],
				resolve: {
					checkAuth: ['checkAuthResolve', function (resolve) {
						return resolve('roles', 'read')
					}]
				}
			})
			// 角色权限 - 添加角色
			.state('main.roles.create', {
				url: '^/admin/setting/roles/create',
				controller: 'rolesChange',
				templateProvider: ['$templateCache', function ($templateCache) {
					return $templateCache.get('roles-change.view.html');
				}],
				resolve: {
					checkAuth: ['checkAuthResolve', function (resolve) {
						return resolve('roles', 'edit')
					}]
				}
			})
			// 角色权限 - 更新角色
			.state('main.roles.update', {
				url: '^/admin/setting/roles/update/:_id',
				controller: 'rolesChange',
				templateProvider: ['$templateCache', function ($templateCache) {
					return $templateCache.get('roles-change.view.html');
				}],
				resolve: {
					checkAuth: ['checkAuthResolve', function (resolve) {
						return resolve('roles', 'edit')
					}]
				}
			})
			// 后台用户 - 显示用户
			.state('main.adminUsers', {
				url: '^/admin/setting/admin-users',
				controller: 'adminUsers',
				templateProvider: ['$templateCache', function ($templateCache) {
					return $templateCache.get('admin-users.view.html');
				}],
				resolve: {
					checkAuth: ['checkAuthResolve', function (resolve) {
						return resolve('adminUsers', 'read')
					}]
				}
			})
			// 后台用户 - 创建用户
			.state('main.adminUsers.create', {
				url: '^/admin/setting/admin-users/create',
				controller: 'adminUsersChange',
				templateProvider: ['$templateCache', function ($templateCache) {
					return $templateCache.get('admin-users-change.view.html');
				}],
				resolve: {
					checkAuth: ['checkAuthResolve', function (resolve) {
						return resolve('adminUsers', 'edit')
					}]
				}
			})
			// 后台用户 - 更新用户
			.state('main.adminUsers.update', {
				url: '^/admin/setting/admin-users/update/:_id',
				controller: 'adminUsersChange',
				templateProvider: ['$templateCache', function ($templateCache) {
					return $templateCache.get('admin-users-change.view.html');
				}],
				resolve: {
					checkAuth: ['checkAuthResolve', function (resolve) {
						return resolve('adminUsers', 'edit')
					}]
				}
			});
	}
	]).run(['checkSignIn', function (checkSignIn) {
		// 每次打开或刷新页面，检查用户是否登录，如果未登录则跳转到登录页
		checkSignIn();
	}]);
/**
 * 创建 Controllers, Services, Directives, Filters 模块
 */
angular.module('controllers', []);
angular.module('services', []);
angular.module('directives', []);
angular.module('filters', []);
angular.module('views', []);