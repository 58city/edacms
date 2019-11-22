var mongoose = require('mongoose');
/**
 * 配置模型
 */
var optionsSchema = new mongoose.Schema({
	// 配置名称：类型字符串，必须
	name: {
		type: String,
		required: true
	},
	// 值：混合类型，可以放置任意值
	value: mongoose.Schema.Types.Mixed
}, {
	collection: 'options',
	id: false
});
module.exports = mongoose.model('Options', optionsSchema);