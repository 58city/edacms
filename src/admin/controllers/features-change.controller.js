/**
 * Features Controller
 */
angular.module('controllers').controller('featuresChange', ['$scope', '$state','$stateParams', '$http','notification',function ($scope, $state, $stateParams, $http,notification) {
	'use strict';
	/**
	 * 初始化变量
	 */
	$scope.disable_form = true;
	$scope.action = 'create';
	$scope._id = '';
	$scope.title = '';
	$scope.url = '';
	$scope.thumbnail = {};
	$scope.extensions = {};
	$scope.media = [];
	$scope.sort = 0;
	$scope.model = {};
	$scope.disabledExtMediaAdd = {};
	/**
	 * 读取当前推荐模型和推荐
	 */			
	async.parallel({
		model: function (callback) {
			$http.get('/api/models/' + $stateParams.model).then(function (res) {
				callback(null, res.data);
			}, function () {
				callback('读取推荐模型失败');
			});
		},
		feature: function (callback) {
			if (!$stateParams.feature) return callback();
			$http.get('/api/features/' + $stateParams.feature).then(function (res) {
				callback(null, res.data);
			}, function () {
				callback('读取推荐信息失败');
			});
		}
	}, function (err, result) {
		if (err) {
			notification.tip({
				type: 'danger',
				message: err
			});
			return false;
		}
		var model = result.model;
		var feature = result.feature;
		$scope.model = model;
		//url存在feature参数，为更新,在scope上挂载数据,初始化视图
		if ($stateParams.feature) {
			$scope.action = 'update';
			$scope._id = feature._id;
			$scope.sort = feature.sort;
			$scope.title = feature.title;
			$scope.url = feature.url;
			$scope.extensions = feature.extensions || {};
			var media_arr=_.filter(model.extensions,{type:"media"});
			media_arr.forEach(item=>{
				checkExtensionsMedia(item.mixed.limit,item.key);
			});
			if (feature.thumbnail) {
				$scope.thumbnail._id = feature.thumbnail._id;
				$scope.thumbnail.uploadStatus = 'success';
				$scope.thumbnail.croppedImage = feature.thumbnail.src;
			}
			if (!_.isEmpty(feature.media)) {
				_.map(feature.media, function (medium) {
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
		}
		$scope.disable_form = false;
	});
	/**
	 * 添加扩展键媒体
	 */
	$scope.addExtensionMedia = function (key, limit) {
		$scope.extensions[key] = $scope.extensions[key] || [];
		$scope.mediaSelect({ limit: limit - $scope.extensions[key].length }, function (media) {
			$scope.extensions[key] = _.concat($scope.extensions[key], media);
			checkExtensionsMedia(limit,key);
		});
	};
	/**
	 * 删除扩展键媒体
	 */
	$scope.removeExtensionsMedia = function (key, limit, medium) {
		_.pull($scope.extensions[key], medium);
		checkExtensionsMedia(limit,key);
	};
	function checkExtensionsMedia(limit,key){
		if (limit - $scope.extensions[key].length < 1) {
			$scope.disabledExtMediaAdd[key] = true;
		} else {
			$scope.disabledExtMediaAdd[key] = false;
		}
	}
	/**
	 * 保存当前推荐
	 */
	$scope.saveFeature = function () {
		$scope.disable_form = true;
		var feature = {
			model: $scope.model._id,
			sort: $scope.sort,
			title: $scope.title,
		};
		if ($scope.url) feature.url = $scope.url;
		// 只要缩略图的id
		if ($scope.thumbnail._id) feature.thumbnail = $scope.thumbnail._id;
		// 只要每个media的id
		if (!_.isEmpty($scope.media)) feature.media = _.map($scope.media, '_id');
		if (!_.isEmpty($scope.extensions)) feature.extensions = $scope.extensions;
		if ($stateParams.feature) {
			$http.put('/api/features/' + $stateParams.feature, feature).then(function () {
				notification.tip({
					type: 'success',
					message: '更新推荐成功'
				});
				$state.go('main.features', null, { reload: 'main.features' });
			}, function () {
				notification.tip({
					type: 'danger',
					message: '更新推荐失败'
				});
			});
		} else {
			$http.post('/api/features', feature).then(function (res) {
				notification.tip({
					type: 'success',
					message: '发布推荐成功'
				});
				$state.go('main.features', null, { reload: 'main.features' });
			}, function (res) {
				notification.tip({
					type: 'danger',
					message: '发布推荐失败'
				});
			});
		}
	};
}]);