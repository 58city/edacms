var path = require('path');
var _ = require('lodash');
var router = require('express').Router();
var requireAll = require('require-all');
var routerTable = require('../core/router');
/**
 * 读取控制器
 */
var controllers = requireAll({
	dirname: path.join(__dirname, '../core/controllers/'),
	filter: /(.+)\.controller\.js$/
});
/**
 * 递归绑定控制器
 * @param  {Object} Router JSON
 */
(function loop(map, route) {
	route = route || '';
	_.forEach(map, function (value, key) {
		if (_.isObject(value) && !_.isArray(value)) {
			// /api: { ... }
			loop(value, route + key);
		} else {
			var controller;
			var action;
			if (_.isString(value)) {
				// get: 'account.current'
				// 获取控制器和方法
				controller = value.split('.')[0];
				action = value.split('.')[1];
			} else if (_.isArray(value)) {
				// get: [110500, 110600, 'roles.list']
				// 权限数组
				var authorities = _.filter(value, function (item) {
					return _.isNumber(item);
				});
				// 控制器数组
				var controllerRouters = _.filter(value, function (item) {
					return _.isString(item);
				});
				// 注册权限控制路由
				if (!_.isEmpty(authorities)) router[key](route, controllers.validation(authorities));
				// 获取控制器和动作
				if (!_.isEmpty(controllerRouters)) {
					controller = controllerRouters[0].split('.')[0];
					action = controllerRouters[0].split('.')[1];
				}
			}
			// 注册所有业务路由
			if (action) {
				router[key](route, controllers[controller][action]);
			} else if (controller) {
				router[key](route, controllers[controller]);
			}
		}
	});
})(routerTable);

module.exports = router;