/**
 * 获取用户信息
 */
angular.module('services').factory('account', ['$rootScope', '$http', '$q', '$cacheFactory',
  	function ($rootScope, $http, $q, $cacheFactory) {
		'use strict';
		var cache = $cacheFactory('account');
		return {
			/**
			 * 获取用户信息
			 * 先从缓存获取，如果缓存没有则从服务器重新读取
			 */
			get: function () {
				var deferred = $q.defer();
				if (cache.get('user')) {
					deferred.resolve(cache.get('user'));
				} else {
					$http.get('/api/account').then(function (res) {
						var data = res.data;
						cache.put('user', data);
						deferred.resolve(data);
					}, function (res) {
						deferred.reject(res.data);
					});
				}
				return deferred.promise;
			},
			/**
			 * 设置权限列表
			 * 根据从服务器读取的用户信息内的权限数组，逐个设置权限列表
			 * 权限列表设置完毕后，返回权限列表
			 */
			auths: function () {
				var self = this;
				return self.get().then(function (user) {
					var auths = {
						features: { read: false, edit: false },
						contents: { read: false, edit: false },
						pages: { read: false, edit: false },
						media: { read: false, edit: false },
						account: { read: false, edit: false },
						siteInfo: { read: false, edit: false },
						categories: { read: false, edit: false },
						contentModels: { read: false, edit: false },
						featureModels: { read: false, edit: false },
						roles: { read: false, edit: false },
						adminUsers: { read: false, edit: false }
					};
					//循环遍历 [100100,100101]
					_.forEach(_.get(user, 'role.authorities'), function (authority) {
						if (authority === 100000) {
							_.forEach(auths, function (authority, key) {
								auths[key] = { read: true, edit: true };
							});
							return false;
						}
						switch (authority) {
							case 100100: auths.features.read  = true; break;
							case 100101: auths.features.edit  = true; break;
							case 100200: auths.contents.read  = true; break;
							case 100201: auths.contents.edit  = true; break;
							case 100300: auths.pages.read  = true; break;
							case 100301: auths.pages.edit  = true; break;
							case 100400: auths.media.read  = true; break;
							case 100401: auths.media.edit  = true; break;
							case 109000: auths.account.read  = true; break;
							case 109001: auths.account.edit  = true; break;
							case 110100: auths.siteInfo.read  = true; break;
							case 110101: auths.siteInfo.edit  = true; break;
							case 110200: auths.categories.read  = true; break;
							case 110201: auths.categories.edit  = true; break;
							case 110300: auths.contentModels.read  = true; break;
							case 110301: auths.contentModels.edit  = true; break;
							case 110400: auths.featureModels.read  = true; break;
							case 110401: auths.featureModels.edit  = true; break;
							case 110500: auths.roles.read  = true; break;
							case 110501: auths.roles.edit  = true; break;
							case 110600: auths.adminUsers.read  = true; break;
							case 110601: auths.adminUsers.edit  = true;
						}
					});
					return auths;
				}, function (error) {
					return error;
				});
			},
			/**
			 * 从缓存中清除用户信息
			 */
			reset: function () {
				cache.remove('user');
			}
		};
  	}
]);