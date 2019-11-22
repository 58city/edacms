/**
 * 检查用户是否登录
 */
angular.module('services').factory('checkSignIn', ['$window','$rootScope', '$state', 'ipCookie',function ($window,$rootScope, $state, ipCookie) {
    'use strict';
	return function () {
		/* 
		 * $rootScope.$on(路由状态，回调函数):监听路由状态的改变
		 * 路由状态(ui.router提供的)：$stateChangeStart、$stateNoFound、$stateChangeSuccess、$stateChangeError
		 * 回调参数：event（当前事件的信息）、toState（目的路由状态）、toParams（传到目的路由的参数）、fromState（起始路由状态）
		 */
		$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
			// 如果session存在，说明已经登录，以下语句不执行
			// 如果session不存在，说明未登录
			// 如果未登录，且不是signIn页面，则跳转到sign页面
			// 如果未登录，且不是install页面，则跳转到sign页面
			if (!ipCookie('edacmsSid') && toState.name !== 'signIn' && toState.name !== 'install') {
				event.preventDefault();
				$state.go('signIn');
			}
			// 退出登录时，清除页面布局配置
			if(toState.name=='signIn'){
				$window.localStorage.clear();
				angular.element('body').removeClass('minified');
			}
		});
	};
}]);