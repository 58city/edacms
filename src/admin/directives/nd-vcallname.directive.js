/**
 * ndCallname Directives
 * 验证调用名是否可用
 */
angular.module('directives').directive('ndVcallname', ['$http','notification',function ($http,notification) {
    'use strict';
    return {
		require: 'ngModel',
		scope: {
			oldCallname: '='
		},
		link: function (scope, element, attrs, ctrl) {
			ctrl.$setValidity('vcallname', true);
			function validate () {
				var callname = element.val();
				var oldCallname = scope.oldCallname;
				if (callname === oldCallname) {
					return ctrl.$setValidity('vCallname', true);
				}
				scope.$parent.inputing = false;
				scope.$parent.checkCallnameing = true;
				$http.get('/api/models', {params: {type: 'feature','mixed.callname': callname}}).then(function (res) {
					if (res.data[0]) {
						ctrl.$setValidity('vcallname', false);
					} else {
						ctrl.$setValidity('vcallname', true);
					}
					scope.$parent.checkCallnameing = false;
				}, function () {
					notification.tip({
						type: 'danger',
						message: '调用名验证未知错误'
					});
					scope.$parent.checkCallnameing = false;
				});
			}
			element.on('input', function () {
				scope.$apply(function () {
					scope.$parent.inputing = true;
				});
			}).on('blur', function () {
				scope.$apply(function () {
					validate();
				});
			});
		}
    }
}]);