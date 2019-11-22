/**
 * 拦截无权限请求
 */
angular.module('services').factory('authorityInterceptor', ['$q', '$injector',function ($q, $injector) {
	'use strict';
	return {
		responseError: function (rejection) {
			// rejection
			// {
			// 	config:{method: "GET", transformRequest: Array(1), transformResponse: Array(1), url: "/api/account", headers: {…}}
			// 	data:{error:{code: "NOT_LOGGED_IN", message: "没有登录"}
			// 	headers:ƒ (name)
			// 	status:401
			// 	statusText:"Unauthorized"
			// }
			if (rejection.status === 401 && rejection.data && rejection.data.error) {
				$injector.get('account').reset();
				switch (rejection.data.error.code) {
					// 没有登录
					case 'NOT_LOGGED_IN':
						$injector.get('$state').go('signIn');
					break;
					// 没有权限
					case 'NO_AUTHORITY':
						var $state = $injector.get('$state');
						if ($state.current.name !== 'main') {
							$state.go('main', {}, { reload: 'main' });
						}
					break;
				}
			}
			// 找不到用户或用户不存在
			if (rejection.status === 404 && rejection.data && rejection.data.error && rejection.data.error.code === 'USER_NOT_FOUND') {
				$injector.get('$state').go('signIn');
			}
			return $q.reject(rejection);
		}
	};
}]);