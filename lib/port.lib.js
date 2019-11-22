var _ = require('lodash');
/**
 * 格式化端口
 * 先从终端参数找端口，没有则从环境变量查找，最后使用默认3000
 * 环境变量端口有可能是字符串，是str则直接返回str
 */
module.exports = function () {
	var PORT = false;
	// node ./bin/www --port 2000
	var portIndex = _.findIndex(process.argv, function (arg) {
		return arg === '--port' || arg === '-p';
	});
	if (portIndex !== -1 && _.isNumber(parseInt(process.argv[portIndex + 1], 10))) {
		PORT = process.argv[portIndex + 1];
	}
	// 如果上述判断条件成立，则PORT为数值，否则PORT仍为false
	// 如果为数值，则val=PORT
	// 如果为false，则val=process.env.PORT || '2000'
	var val = PORT || process.env.PORT || '2000';

	var port = parseInt(val, 10);
	// 如果val经转换后的port为数值且大于0，则返回数值
	if (port >= 0) {
		return port;
	}
	// 如果val经转换后的port为NaN,说明PORT为false,process.env.PORT为非数值，直接返回非数值的val
	if (isNaN(port)) {
		return val;
	}
	return false;
};