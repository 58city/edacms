var async = require('async');
var _ = require('lodash');
var moment = require('moment');
var categories = require('../models/categories.model');
var contents = require('../models/contents.model');
var contentsService = require('../services/contents.service');
/**
 * 所有内容列表
 */
exports.all = function (callback) {
	async.waterfall([
		// 查询分类数据
		// 获取类型为channel和column的分类数据
		function (callback) {
			categories.find({ type: { $in: ['channel', 'column'] } })
			.select('type name path isShow sort')
			.sort('sort')
			.lean()
			.exec(callback);
		},
		// 重新组织分类数据
		// 对获取到的channel和column分类数据，进行重新组织
		// 为column找到所属的channel，并以id数组的形式存储在channel的node属性下
		function (list, callback) {
			var source = _.partition(list, function (category) {
				return category.path.split('/').length === 2;
			});
			var categories = _.sortBy(source[0], 'sort');
			var otherCategories = source[1];
			_.forEach(categories, function (category) {
				if (category.type === 'channel') {
					var source = _.partition(otherCategories, function (otherCategory) {
						return new RegExp('^' + category.path + '/').test(otherCategory.path);
					});
					if (!_.isEmpty(source[0])) {
						category.node = _.map(_.sortBy(source[0], 'sort'), '_id');
					}
					otherCategories = source[1];
				}
			});
			callback(null, categories);
		},
		// 重新组织分类数据
		// 循环遍历channel，获取channel.node中所有栏目的内容
		// 把获取的内容经过处理，挂载到channel的contents属性下
		function (categories, callback) {
			async.map(categories, function (category, callback) {
				if (category.node) {
					contents.find({ category: { $in: category.node }, status: 'pushed', deleted: false })
					.sort('-date')
					.limit(50)
					.select('category title alias abstract user date reading thumbnail extensions')
					.populate('category', 'name path')
					.populate('user', 'nickname email')
					.populate('thumbnail', 'fileName description date src')
					.exec(function (err, contents) {
						if (err) return callback(err);
						category.contents = _.map(contents, function (content) {
							if (content.thumbnail) {
								var thumbnailSrc = content.thumbnail.src;
							}
							content = content.toObject();
							if (_.get(content, 'category.path')) {
								content.href = content.category.path + '/' + content.alias;
							}
							if (content.thumbnail) content.thumbnail.src = thumbnailSrc;
							delete content.alias;
							return content;
						});
						callback(null, category);
					});
				} else {
					contents.find({ category: category._id, status: 'pushed', deleted: false, date: { $lte: new Date() } })
						.sort('-date')
						.limit(50)
						.select('category title alias abstract user date reading thumbnail')
						.populate('category', 'name path')
						.populate('user', 'nickname email')
						.populate('thumbnail', 'fileName description date')
						.exec(function (err, contents) {
							if (err) return callback(err);
							category.contents = _.map(contents, function (content) {
								if (content.thumbnail){
									var thumbnailSrc = content.thumbnail.src;
								}
								content = content.toObject();
								if (_.get(content, 'category.path')) {
									content.href = content.category.path + '/' + content.alias;
								}
								if (content.thumbnail){
									content.thumbnail.src = thumbnailSrc
								};
								delete content.alias;
								return content;
							});
							callback(null, category);
						});
				}
			}, callback);
		}
	], function (err, list) {
		if (err) err.type = 'database';
		callback(err, list);
	});
};
/**
 * 频道内容列表
 */
exports.channel = function (options, callback) {
	async.auto({
		getColumns:function (callback) {
			var regex = new RegExp('^' + options.path, 'i');
			categories
				.find({ path: regex, type: 'column' })
				.select('name path sort type isShow model')
				.sort('sort')
				.populate('model','extensions')
				.lean()
				.exec(callback);
		},
		getContents:['getColumns',function (callback, results) {
			async.map(results.getColumns, function (column, callback) {
				contents.find({ category: column._id, status: 'pushed', deleted: false, date: { $lte: new Date() } })
					.sort('-date')
					.limit(50)
					.select('category title alias user date reading thumbnail abstract extensions')
					.populate('category', 'name path')
					.populate('user', 'nickname email')
					.populate('thumbnail', 'fileName description date src')
					.exec(function (err, contents) {
						if (err) return callback(err);
						column.contents = _.map(contents, function (content) {
							if (content.thumbnail) var thumbnailSrc = content.thumbnail.src;
							content = content.toObject();
							if (_.get(content, 'category.path')) content.href = content.category.path + '/' + content.alias;
							if (content.thumbnail) content.thumbnail.src = thumbnailSrc;
							delete content.alias;
							return content;
						});
						callback(null, column);
					});
			}, callback);
		}]
	}, function (err, results) {
		if (err) err.type = 'database';
		callback(err, results.getContents);
	});
};
/**
 * 栏目内容列表
 */
exports.column = function (options, callback) {
	var query={status:'pushed',deleted:false,date:{'$lte':new Date()}};
	if (options._id) query._id=options._id;
	if (options.pageSize) query.pageSize=options.pageSize;
	if (options.currentPage) query.currentPage=options.currentPage;
	if (options.extensions) query.extensions=options.extensions;
	var currentPage= options.currentPage ? options.currentPage : 1;
	contentsService.list(query, function (err, result) {
		if (err) return callback(err);
		var pagesList = [];
		switch (true) {
			case result.pages <= 7:
				for (var i = 0; i < result.pages; i++) {
					pagesList[i] = {
						name: i + 1,
						index: i + 1
					};
				}
			break;
			case currentPage <= 3:
				pagesList = [
					{ name: 1, index: 1 },
					{ name: 2, index: 2 },
					{ name: 3, index: 3 },
					{ name: 4, index: 4 },
					{ name: 5, index: 5 },
					{ name: 6, index: 6 },
					{ name: '...' + result.pages, index: result.pages }
				]
			break;
			case currentPage > 3 && currentPage <= result.pages - 3:
				pagesList.push({ name: '1...', index: 1 });
				for (var i = currentPage - 2; i <= currentPage + 2; i++) {
					pagesList.push({ name: i, index: i });
				}
				pagesList.push({ name: '...' + result.pages, index: result.pages });
			break;
			case currentPage > result.pages - 3:
				pagesList.push({ name: '1...', index: 1 });
				for (var i = result.pages - 5; i <= result.pages; i++) {
					pagesList.push({ name: i, index: i });
				}
		}
		result.pagination = _.map(pagesList, function (item) {
			if (item.index === currentPage) item.active = true;
			return item;
		});
		delete result.pages;
		callback(null, result);
	});
};
/**
 * 阅读列表
 */
exports.reading = function (options, callback) {
	var query = {
		status: 'pushed', 
		deleted: false, 
		date: { $lte: new Date() } 
	};
	if (options._id) {
		query.category = options._id;
	}
	var sort = '-reading.total';
	if (options.sort) {
		sort = options.sort;
		switch (sort) {
			case '-reading.day':
				// 获取当前天的开始时间
				query['reading.createAt.day'] = { $gte: new Date(moment(000000, 'hhmmss').format()) };
			break;
			case '-reading.week':
				// 获取当前周的开始时间
				query['reading.createAt.week'] = { $gte: new Date(moment(000000, 'hhmmss').isoWeekday(1).format()) };
			break;
			case '-reading.month':
				// 获取当前月的开始时间
				query['reading.createAt.month'] = { $gte: new Date(moment(000000, 'hhmmss').set('date', 1).format()) };
		}
	}
	// 获取某个channel下的，总/月/周/日排行列表
	if (options.path) {
		async.waterfall([
			function (callback) {
				var regex = new RegExp('^' + options.path, 'i');
				categories.find({path:regex, type: 'column'})
				.select('name path sort type isShow')
				.lean()
				.exec(callback);
			},
			function (columns, callback) {
				var columnIds = _.map(columns, '_id');
				query.category = { $in: columnIds };
				contents.find(query)
				.sort(sort)
				.limit(options.limit || 50)
				.select('category title alias abstract user date reading thumbnail extensions')
				.populate('category', 'name path')
				.populate('user', 'nickname email')
				.populate('thumbnail', 'fileName description date')
				.exec(function (err, contents) {
					if (err) return callback(err);
					contents = _.map(contents, function (content) {
						if (content.thumbnail) var thumbnailSrc = content.thumbnail.src;
						content = content.toObject();
						if (_.get(content, 'category.path')) {
							content.href = content.category.path + '/' + content.alias;
						}
						if (content.thumbnail) {
							content.thumbnail.src = thumbnailSrc;
						}
						delete content.alias;
						delete content.reading.createAt;
						return content;
					});
					callback(null, contents);
				});
			}
		], function (err, list) {
			if (err) err.type = 'database';
			callback(err, list);
		});
	// 获取全部channel下的，总/月/周/日排行列表
	} else {
		contents.find(query)
		.sort(sort)
		.limit(options.limit || 50)
		.select('category title alias abstract user date reading thumbnail extensions')
		.populate('category', 'name path')
		.populate('user', 'nickname email')
		.populate('thumbnail', 'fileName description date')
		.exec(function (err, contents) {
			if (err) {
				err.type = 'database';
				return callback(err);
			}
			contents = _.map(contents, function (content) {
				if (content.thumbnail) {
					var thumbnailSrc = content.thumbnail.src;
				}
				content = content.toObject();
				if (_.get(content, 'category.path')){
					content.href = content.category.path + '/' + content.alias;
				}

				if (content.thumbnail) {
					content.thumbnail.src = thumbnailSrc;
				}
				delete content.alias;
				delete content.reading.createAt;
				return content;
			});
			callback(null, contents);
		});
	}
};
/**
 * 搜索列表
 */
exports.search = function (options, callback) {
	var words = options.words || '';
	var pageSize = options.pageSize || 50;
	var currentPage = 1;

	if (!isNaN(options.currentPage)) currentPage = options.currentPage;

	contentsService.list({ words: words, status: 'pushed', deleted: false, pageSize: pageSize, currentPage: currentPage, date: { '$lte': new Date() } }, function (err, result) {
		if (err) return callback(err);

		var pagesList = [];

		switch (true) {
			case result.pages <= 7:
				for (var i = 0; i < result.pages; i++) {
					pagesList[i] = {
						name: i + 1,
						index: i + 1
					};
				}

				break;
			case currentPage <= 3:
				pagesList = [
					{ name: 1, index: 1 },
					{ name: 2, index: 2 },
					{ name: 3, index: 3 },
					{ name: 4, index: 4 },
					{ name: 5, index: 5 },
					{ name: 6, index: 6 },
					{ name: '...' + result.pages, index: result.pages }
				]

				break;
			case currentPage > 3 && currentPage <= result.pages - 3:
				pagesList.push({ name: '1...', index: 1 });
				for (var i = currentPage - 2; i <= currentPage + 2; i++) {
					pagesList.push({ name: i, index: i });
				}
				pagesList.push({ name: '...' + result.pages, index: result.pages });

				break;
			case currentPage > result.pages - 3:
				pagesList.push({ name: '1...', index: 1 });
				for (var i = result.pages - 5; i <= result.pages; i++) {
					pagesList.push({ name: i, index: i });
				}
		}

		result.pagination = _.map(pagesList, function (item) {
			if (item.index === currentPage) item.active = true;
			return item;
		});

		delete result.pages;

		callback(null, result);
	});
};