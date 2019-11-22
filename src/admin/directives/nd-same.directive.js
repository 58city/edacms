/**
 * ndSame Directives
 * 验证两次输入是否相同
 */
angular.module('directives').directive('ndSame', function () {
	return {
		require: 'ngModel',
		link: function (scope, element, attrs, ctrl) {
			// 添加nd-same参数中指定的元素，到元素列表中,共同监听两个input元素
			element.add(attrs.ndSame).on('input', function () {
				scope.$apply(function () {
					var same = element.val() === $(attrs.ndSame).val();
					ctrl.$setValidity('same', same);
				});
			});
		}
	}
});