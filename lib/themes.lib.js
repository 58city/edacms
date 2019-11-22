var fs = require('fs');
var requireAll = require('require-all');
var path = require('path');
var _ = require('lodash');
var async = require('async');
var hbs = require('express-hbs');
var options = require('../core/models/options.model');
/**
 * 读取 Helper
 */
var helpers = requireAll({
	dirname: path.join(__dirname, '../core/helpers/'),
	filter: /(.+)\.helper\.js$/,
	excludeDirs: /^\.(git|svn)$/
});
/**
 * 读取 Async Helper
 */
var asyncHelpers = requireAll({
	dirname: path.join(__dirname, '../core/helpers/'),
	filter: /(.+)\.asyncHelper\.js$/,
	excludeDirs: /^\.(git|svn)$/
});
/**
 * 注册 Helper
 */
_.forEach(helpers, function (helper, key) {
	// console.log(key)
	// compare,dateformat,foreach,text
	hbs.registerHelper(key, helper);
});
/**
 * 注册 Async Helper
 */
_.forEach(asyncHelpers, function (helper, key) {
	// console.log(key)
	// features
	hbs.registerAsyncHelper(key, helper);
});
/**
 * 设置模板引擎
 * @param app 应用
 * @param directory 模板目录
 */
function viewEngine(app, directory) {
	app.cache = {};	
	// 自定义模板引擎：
	// 第一个参数指定模板引擎的名称，同时也决定了模板引擎能处理的模板的后缀名
	// 第二个参数指定模板引擎的渲染工具,这里用的是hbs，也可以使用ejs/art-template等
	app.engine('.hbs', hbs.express4({
		layoutsDir: 'public/themes/' + directory,
		partialsDir: 'public/themes/' + directory,
		extname: '.hbs'
	}));
	// 使用什么模板引擎
	// 第一个参数固定
	// 第二个参数为使用到的模板引擎名称（app.engine的第一个参数）
	app.set('view engine', 'hbs');
	// 模板文件放在哪里
	app.set('views', 'public/themes/' + directory);

	// 注意:ejs模板引擎
	// 处理的模板后缀名如果就是默认的.ejs,只需app.set('view engine', 'ejs')，无需app.engine;
	// 处理的模板后缀名如果是html,则需自定义模板引擎app.engine('html',ejs.__express)，并使用app.set('view engine', 'html');
}
exports.init = function (app, callback) {
	options.findOne({ name: 'siteInfo' }, function (err, siteInfo) {
		if (err) {
			err.type = 'database';
			return callback(err);
		}
		(function checkDirectory(directory) {
			fs.stat(path.join(__dirname, '../public/themes/' + directory), function (err, stats) {
				if (stats && stats.isDirectory()) {
					viewEngine(app, directory);
					callback();
				} else {
					if (directory !== 'default') {
						checkDirectory('default');
					} else {
						callback(directory + '目录不存在或非法');
					}
				}
			});
		})(_.get(siteInfo, 'value.theme') || 'default');
	});
};
exports.get = function (callback) {
	async.waterfall([
		//读取主题目录下所有文件夹，并把读取结果通过callback传递给下一个函数
		function (callback) {
			fs.readdir(path.join(__dirname, '../public/themes/'), callback);
		},
		//从所有文件夹中提取包含package.json文件的文件夹，并把读取结果通过callback传递给下一个函数
		//这里注意外层callback和async.filter第二个参数的参数callback是不一样的
		function (files, callback) {
			async.filter(files, function (file, callback) {
				fs.exists(path.join(__dirname, '../public/themes/' + file + '/package.json'), function (exist) {
					callback(exist);
				});
			}, function (files) {
				callback(null, files);
			});
		},
		//从所有的package.json文件中读取主题，并把读取结果通过callback传递给最终的结果接收函数
		//这里注意由于外层callback和async.map的接收结果的回调形式一致，所以直接用外层的callback接收map结果
		function (files, callback) {
			async.map(files, function (directory, callback) {
				fs.readFile(path.join(__dirname, '../public/themes/' + directory + '/package.json'), function (err, bin) {
					if (err) return callback(err);
					if (bin[0] === 0xEF && bin[1] === 0xBB && bin[2] === 0xBF) {
						bin = bin.slice(3);
					}
					var theme = {
						directory: directory,
						name: JSON.parse(bin).name
					};
					callback(null, theme);
				});
			}, callback);
		}
	], function (err, themes) {
		if (err) err.type = 'system';
		callback(err, themes);
	});
};
exports.set = function (app, directory, callback) {
	fs.stat(path.join(__dirname, '../public/themes/' + directory), function (err, stats) {
		if (err) {
			err.type = 'system';
			return callback(err);
		}
		if (stats && stats.isDirectory()) {
			viewEngine(app, directory);
			callback(null);
		} else {
			var err = {
				type: 'system',
				error: directory + '目录不存在或非法'
			};
			callback(err);
		}
	});
};