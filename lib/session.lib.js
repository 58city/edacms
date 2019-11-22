var mongoose = require('mongoose');
var session = require('express-session');
var sessionConfig = require('../config/session.config');
// 检查数据库是否已经连接
// 如果未连接，则初始化req.session = 'init'
// 如果已连接，并且为第一次连接（req.session === 'init'），则删除session
exports.check = function () {
	return function (req, res, next) {
		if (!mongoose.connection.name) {
			req.session = 'init';
		} else {
			if (req.session === 'init') delete req.session;
		}
		next();
	}
};
exports.init = function () {
	return session(sessionConfig);
};