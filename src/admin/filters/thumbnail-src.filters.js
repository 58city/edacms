/**
 * thumbnailSrc Filters
 * 缩略图转 SRC
 */
angular.module('filters').filter('thumbnailSrc', function () {
    return function (thumbnail) {
		if (thumbnail) {
			// /media/201909/5d80a1ff7c1ebd030c7f2f67/4.jpg
			return '/media/' + moment(thumbnail.date).format('YYYYMM') + '/' + thumbnail._id + '/' + thumbnail.fileName;
		} else {
			return;
		}
    }
});