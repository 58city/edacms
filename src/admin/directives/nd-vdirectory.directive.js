/**
 * ndVdirectory Directives
 * 验证目录是否可用
 */
angular.module('directives').directive('ndVdirectory', ['$http','notification',function ($http,notification) {
    'use strict';
    return {
      	require: 'ngModel',
		scope: {
			prePath: '=',
			oldPath: '='
		},
      	link: function (scope, element, attrs, ctrl) {
			ctrl.$setValidity('vdirectory', true);
			function validate () {
				var oldPath = scope.oldPath;
				var prePath = scope.prePath;
				var directory = element.val().toLowerCase();
				scope.$parent.inputing = false;
				scope.$parent.checkDirectorying = true;
				var filter = ['admin','api','openapi','open','themes','media','assets'];
				// 如果上级目录不存在，则为顶级分类，如果顶级分类目录名和上面的保留名称冲突，则显示错误
				if (!prePath) {
					for (var i = 0; i < filter.length; i++) {
						if (directory === filter[i]) {
							scope.$parent.checkDirectorying = false;
							return ctrl.$setValidity('vdirectory', false);
						}
					}
				}
				// 拼接完整路径名称
				var paramsPath;
				if (prePath) {
					paramsPath = prePath + '/' + directory;
				} else {
					paramsPath = '/' + directory;
				}
				if (paramsPath === oldPath) {
					return ctrl.$setValidity('vdirectory', true);
				}
				// 根据拼接成的完整路径，从数据库查找是否存在有相同路径的分类
				$http.get('/api/categories', {params: { path: paramsPath }}).then(function (res) {
					var data = res.data;
					if (data) {
						ctrl.$setValidity('vdirectory', false);
					} else {
						ctrl.$setValidity('vdirectory', true);
					}
					scope.$parent.checkDirectorying = false;
				}, function () {
					notification.tip({
						type: 'danger',
						message: '目录名验证未知错误'
					});
					scope.$parent.checkDirectorying = false;
				});
			}
			scope.$watch('prePath', function (newValue, oldValue) {
				if (newValue !== oldValue) validate();
			});
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