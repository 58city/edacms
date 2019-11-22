var async = require('async');
var _ = require('lodash');
var siteInfoService = require('../services/site-info.service');
var categoriesService = require('../services/categories.service');
var listsService = require('../services/lists.service');
/**
 * 频道
 */
module.exports = function (req, res, next) {
	var channelPath = '/' + req.params.channel + req.params[0];
	console.log("我是频道页",req.params)
	// http://localhost:3000/series/china/lu-zhan-zhi-wang-5 ==> {'0':'/china/lu-zhan-zhi-wang-5',channel:'series'}
	categoriesService.one({path: channelPath,type: 'channel'}, function (err, category) {
		if (err) return res.status(500).end();
		if (!category) return next();
		async.parallel({
			siteInfo: siteInfoService.get,
			navigation: function (callback) {
				categoriesService.navigation({ current: channelPath }, callback);
			},
			category:function(callback){
				categoriesService.getColumnModel({path:new RegExp('^'+category.path,'i')},function(err,model){
					if(err) return callback(err);
					category.model=model;
					callback(null);
				})
			},
			lists: function (callback) {
				listsService.channel(category, callback);
			},
			localReadingTotal: function (callback) {
				listsService.reading({ path: channelPath }, callback);
			},
			localReadingDay: function (callback) {
				listsService.reading({ path: channelPath, sort: '-reading.day' }, callback);
			},
			localReadingWeek: function (callback) {
				listsService.reading({ path: channelPath, sort: '-reading.week' }, callback);
			},
			localReadingMonth: function (callback) {
				listsService.reading({ path: channelPath, sort: '-reading.month' }, callback);
			}
		}, function (err, results) {
			if (err) return res.status(500).end();
			res.render(_.get(category, 'views.channel'), {
				layout: _.get(category, 'views.layout'),
				siteInfo: results.siteInfo,
				navigation: results.navigation,
				category: category,
				lists: results.lists,
				readingList: {
					total: results.localReadingTotal,
					day: results.localReadingDay,
					week: results.localReadingWeek,
					month: results.localReadingMonth
				}
			});
		});
	});
};