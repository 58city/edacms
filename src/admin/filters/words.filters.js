/**
 * Words Filters
 * 截取字符串
 */
angular.module('filters').filter('words', function () {
	return function (str, limit_num) {
		if (str && str.length > limit_num) {
			str = str.substr(0, parseInt(limit_num, 10) - 3) + '...';
		}
		return str;
	}
});