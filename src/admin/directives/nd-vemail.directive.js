/**
 * ndVemail Directives
 * 验证邮箱是否已被注册
 */
angular.module('directives').directive('ndVemail', ['$http','notification',function ($http,notification) {
    'use strict';
    return {
      	require: 'ngModel',
		link: function (scope, element, attrs, ng_model) {
			element.on('input',function(){
				scope.$parent.inputing = true;
			}).on('blur', function () {
				if (scope.$eval(attrs.ndVemail)) {
					scope.$parent.checkEmailing = true;
					$http.get('/api/users', {params: {email: element.val()}}).then(function (res) {
						if (res.data) {
							// 向$error对象新增错误监控字段，false代表有错
							ng_model.$setValidity('vemail', false);
						} else {
							// 向$error对象新增错误监控字段，true代表通过
							ng_model.$setValidity('vemail', true);
						}
						scope.$parent.checkEmailing = false;
					}, function () {
						notification({
							type: 'danger',
							message: '邮箱验证未知错误'
						});
						scope.$parent.checkEmailing = false;
					});
				} else {
					// 向$error对象新增错误监控字段，true代表通过
					ng_model.$setValidity('vemail', true);
				}
			});
		}
    }
}]);