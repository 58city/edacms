/**
 * Content Change Controller
 */
angular.module('controllers').controller('contentChange', ['$scope', '$state', '$stateParams', '$http', 'pinyin', '$filter','notification',function ($scope, $state, $stateParams, $http, pinyin, $filter,notification) {
    'use strict';
    /**
     * 初始化变量
     */
    $scope.disable_form = false;
    $scope.action = 'create';
    $scope.categoryId = $stateParams.category;
    $scope._id = $stateParams.content;
	
    $scope.title = '';
    $scope.alias = '';
    $scope.abstract = '';
    $scope.content = '';
	$scope.tags = '';
	$scope.thumbnail = {};

	$scope.extensions = {};
	$scope.media = [];
	$scope.disabledExtMediaAdd = {};
	
	$scope.status = 'draft';
    $scope.releaseDate = 'now';
    $scope.date = $filter('date')(new Date(), 'yyyy年MM月dd日');
    $scope.hour = $filter('date')(new Date(), 'HH');
    $scope.minute = $filter('date')(new Date(), 'mm');
    /**
     * 绑定 Alias 翻译
	 * 如果title被修改，重新翻译新的title，作为URL
	 * 否则继续使用缓存的老的URL
     */
    $scope.$watch('title', function (newTitle) {
		$scope.alias = pinyin(newTitle);
	});
    /**
     * 读取当前内容
     * @param  {String} $stateParams.content 内容ID
     */
    if ($stateParams.content) {
      	$scope.action = 'update';
      	$scope.disable_form = true;
      	$http.get('/api/contents/' + $stateParams.content, { params: { markdown: true } }).then(function (res) {
          	if (res.data) {
				$scope.disable_form = false;
				var content = res.data;
				
				$scope.title = content.title;
				$scope.alias = content.alias;
				if (content.abstract) $scope.abstract = content.abstract;
				if (content.content) $scope.content = content.content;
				if (content.tags) $scope.tags = content.tags.join(',');
				if (content.thumbnail) {
					$scope.thumbnail._id = content.thumbnail._id;
					$scope.thumbnail.uploadStatus = 'success';
					$scope.thumbnail.croppedImage = content.thumbnail.src;
				}

				if (!_.isEmpty(content.media)) {
					_.map(content.media, function (medium) {
						var fileNameLast = _.get(medium.fileName.match(/^.+\.(\w+)$/), 1);
						var _medium = {
							file: null,
							fileName: medium.fileName,
							fileNameLast: fileNameLast,
							isImage: false,
							description: medium.description,
							src: medium.src,
							_id: medium._id,
							uploadStatus: 'success',
							active: false,
							edited: false
						};
						switch (fileNameLast) {
							case 'jpg':
							case 'jpeg':
							case 'png':
							case 'gif':
								_medium.isImage = true;
						}
						$scope.media.push(_medium);
					});
				}
				if (content.extensions) {
					$scope.extensions = content.extensions;
					_.map($scope.category.model.extensions, function (extension) {
						if (extension.type === 'media') {
							if ($scope.extensions[extension.key] && extension.mixed.limit - $scope.extensions[extension.key].length < 1) {
								$scope.disabledExtMediaAdd[extension.key] = true;
							} else {
								$scope.disabledExtMediaAdd[extension.key] = false;
							}
						}
					});
				}

				$scope.status = content.status;
				if (content.status === 'pushed') {
					$scope.date = $filter('date')(content.date, 'yyyy年MM月dd日');
					$scope.hour = $filter('date')(content.date, 'HH');//大写24小时制
					$scope.minute = $filter('date')(content.date, 'mm');
					$scope.releaseDate = 'current';
				}
          	} else {
            	$state.go('main.contents', { category: $scope.categoryId }, { reload: 'main.contents' });
			}
        }, function () {
			notification.tip({
				type: 'danger',
				message: '获取内容失败'
			});
        });
    }
    /**
     * 添加扩展信息媒体
     */
    $scope.addExtensionMedia = function (key, limit) {
      	$scope.extensions[key] = $scope.extensions[key] || [];
      	$scope.mediaSelect({ limit: limit - $scope.extensions[key].length }, function (media) {
        	$scope.extensions[key] = _.concat($scope.extensions[key], media);
			if (limit - $scope.extensions[key].length < 1) {
				$scope.disabledExtMediaAdd[key] = true;
			} else {
				$scope.disabledExtMediaAdd[key] = false;
			}
      	});
    };
    /**
     * 删除扩展信息媒体
     */
    $scope.removeExtensionsMedia = function (key, limit, medium) {
		_.pull($scope.extensions[key], medium);
		if (limit - $scope.extensions[key].length < 1) {
			$scope.disabledExtMediaAdd[key] = true;
		} else {
			$scope.disabledExtMediaAdd[key] = false;
		}
	};
    /**
     * 保存当前内容
     */
    $scope.saveContent = function () {
		$scope.disable_form = true;
		var content = {
			status: $scope.status,
			category: $scope.categoryId,
			title: $scope.title,
			alias: $scope.alias
		};
      	if ($scope.thumbnail._id) content.thumbnail = $scope.thumbnail._id;
      	if (!_.isEmpty($scope.media)) content.media = _.map($scope.media, '_id');
		if ($scope.abstract !== '' || $scope.abstract !== undefined) {
			content.abstract = $scope.abstract;
		}
		if ($scope.content !== '' || $scope.content !== undefined) {
			content.content = $scope.content;
		}
		if ($scope.releaseDate === 'current') {
			content.date = moment($scope.date, 'YYYY年MM月DD日').hour($scope.hour).minute($scope.minute).format();
		} else if ($scope.releaseDate === 'now') {
			content.date = moment().format();
		}
		if ($scope.tags !== '' && $scope.tags !== undefined) {
			var tags = angular.copy($scope.tags);
			tags = tags.replace(/，| /g, ',');
			content.tags = tags.split(',');
		}
		if (!$.isEmptyObject($scope.extensions)) {
			content.extensions = $scope.extensions;
		}
      	if ($stateParams.content) {
			$http.put('/api/contents/' + $stateParams.content, content).then(function (res) {
				notification.tip({
					type: 'success',
					message: '修改内容成功'
				});
				$state.go('main.contents', { category: $scope.categoryId }, { reload: 'main.contents' });
			});
      	} else {
        	$http.post('/api/contents', content).then(function (res) {
				if ($scope.status === 'draft') {
					notification.tip({
						type: 'success',
						message: '保存草稿成功'
					});
				} else if ($scope.status === 'pushed') {
					notification.tip({
						type: 'success',
						message: '发布内容成功'
					});
				}
            	$state.go('main.contents', { category: $scope.categoryId }, { reload: 'main.contents' });
          	}, function () {
				notification.tip({
					type: 'danger',
					message: '发布内容失败'
				});
          	});
      	}
	};
}]);