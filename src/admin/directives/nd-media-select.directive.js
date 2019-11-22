/**
 * ndMediaSelect Directives
 * 媒体库模态窗
 * 存在问题：
 * 修改媒体信息后scope.media的src可以动态更新，实时显示；
 * 但是scope.$parent.extensions['upload']中原来已经存在的同一个媒体，不能同步更新src，导致不能正常显示
 */
angular.module('directives').directive('ndMediaSelect',  ['$templateCache', 'notification', '$http', 'Upload',function ($templateCache, notification, $http, Upload) {
    return {
      	restrict: 'E',
      	replace: true,
      	template: $templateCache.get('media-select.view.html'),
      	scope: {
        	media: '='
      	},
		link: function (scope, element, attr, ctrl) {
			'use strict';
			/**
			 * 初始化变量
			 */
			scope.disable_form = false;
			scope.selectLimit = 0;
			scope.callback = null;
			scope.mediaStore = [];
			scope.selectView = 'list';
			// 保存当前正在编辑的媒体对象
			scope.medium = {};
			scope.mediumId = '';
			scope.fileNameFirst = '';
			scope.fileNameLast = '';
			scope.description = '';
			// 保存图片信息编辑栏的显示状态
			scope.thumbnailInfoView = false;
			// 保存插入和移除按钮的禁用状态
			scope.disabledSelectViewRemove = true;
			scope.disabledSelectViewinsert = true;
			// 保存上传按钮的显示状态
			scope.disabledUploadThumbnail = false;
			/**
			 * 检查是否达到选择个数限制及禁用选择
			 */
			function checkDisabledUploadThumbnail () {
				var activeMediaItems;
				// 获取选中个数
				switch (scope.selectView) {
					case 'list':
						activeMediaItems = _.filter(scope.media, { 'active': true }).length;
					break;
					case 'store':
						activeMediaItems = _.filter(scope.mediaStore, { 'active': true }).length;
					break;
				}
				// 选中个数超出限制，设置禁用属性
				if (scope.selectLimit && scope.selectLimit - activeMediaItems < 1) {
					scope.disabledUploadThumbnail = true;
				} else {
					scope.disabledUploadThumbnail = false;
				}
			}
			/**
			 * 向外层暴露媒体库接口
			 * @param options
			 * @param callback
			 */
			scope.$parent.mediaSelect = function (options, callback) {
				scope.selectLimit = options.limit || null;
				scope.callback = callback || null;
				checkDisabledUploadThumbnail();
				element.modal('show');
			};
			element.on('hidden.bs.modal', function () {
				scope.$apply(function () {
					scope.selectView = 'list';
				});
			});
			/**
			 * 切换媒体库和媒体列表
			 * @param target
			 */
			scope.selectMediaViews = function (target) {
				// 切换到对应视图
				scope.selectView = target;
				// 取消媒体信息修改域的显示
				scope.thumbnailInfoView = false;
				scope.medium.edited = false;
				// 把每一个媒体重置为未选择状态
				_.map(scope.media, function (medium) { 
					return medium.active = false 
				});
				_.map(scope.mediaStore, function (medium) { 
					return medium.active = false 
				});
				// 禁用插入按钮和移除按钮
				scope.disabledSelectViewRemove = true;
				scope.disabledSelectViewinsert = true;
				// 检查是否达到选择个数限制及禁用选择
				checkDisabledUploadThumbnail();
			};
			/**
			 * 切换媒体选择状态
			 */
			scope.selectMediaActive = function (medium) {
				// 如果数量超出,则未激活的禁用（不能再点）
				if ( scope.disabledUploadThumbnail && medium.active === false ) return false;
				medium.active = !medium.active;
				switch (scope.selectView) {
					case 'list':
						//如果有选中的媒体，则解除插入按钮和移除按钮的禁用 
						if (_.filter(scope.media, function (medium) { return medium.active })[0]) {
							scope.disabledSelectViewRemove = false;
							scope.disabledSelectViewinsert = false;
						} else {
							scope.disabledSelectViewRemove = true;
							scope.disabledSelectViewinsert = true;
						}
					break;
					case 'store':
						//如果有选中的媒体，则解除插入按钮的禁用 
						if (_.filter(scope.mediaStore, function (medium) { return medium.active })[0]) {
							scope.disabledSelectViewinsert = false;
						} else {
							scope.disabledSelectViewinsert = true;
						}
					break;
				}
				// 检查是否达到选择个数限制及禁用选择
				checkDisabledUploadThumbnail();
			};
			/**
			 * 切换媒体信息修改域
			 * @param medium
			 * @param $event
			 */
			scope.selectMediaInfo = function (medium, $event) {
				$event.stopPropagation();
				if (medium._id !== scope.mediumId) {
					// 显示媒体信息修改区域
					scope.thumbnailInfoView = true;
					// 高亮当前媒体编辑按钮
					medium.edited = true;
					// 隐藏之前媒体编辑按钮
					scope.medium.edited = false;
					// 更新作用域上的当前媒体详情信息
					scope.medium = medium;
					scope.mediumId = medium._id;
					scope.fileNameFirst = _.get(medium.fileName.match(/^(.+)(\.\w+)$/), 1);
					scope.fileNameLast = _.get(medium.fileName.match(/^(.+)(\.\w+)$/), 2);
					scope.description = medium.description;
				} else {
					scope.thumbnailInfoView = !scope.thumbnailInfoView;
					medium.edited = !medium.edited;
				}
			};
			/**
			 * 保存媒体详情信息
			 */
			scope.saveMediaInfo = function () {
				scope.disable_form = true;
				var data = {
					fileName: scope.fileNameFirst + scope.fileNameLast
				};
				if (scope.description) data.description = scope.description;
				$http.put('/api/media/' + scope.mediumId, data).then(function (res) {
					scope.disable_form = false;
					scope.medium.fileName = _.clone(scope.fileNameFirst + scope.fileNameLast);
					scope.medium.description = _.clone(scope.description);
					//此处可以为scope.medium.src赋新名称，让最新插入的同一个媒体能正常显示，但原来插入的仍不能显示
					notification.tip({
						type: 'success',
						message: '图片信息保存成功'
					});
				}, function () {
					notification.tip({
						type: 'danger',
						message: '图片信息保存失败'
					});
				});
			};
			/**
			 * 读取媒体库
			 */
			function getMedia () {
				scope.mediaStore = [];
				$http.get('/api/media', {params: {currentPage: 1,pageSize: 9} }).then(function (res) {
					var data = res.data.media;
					_.map(data, function (medium) {
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
						scope.mediaStore.push(_medium);
					});
				});
			}
			getMedia();
			/**
			 * 上传媒体
			 */
			scope.uploadMedia = function (files) {
				if (!files) return false;
				// 初始化新增的媒体基本字段，并添加到scope.media中，渲染到页面
				// 此时尚未上传显示“虚化的blob预览图”和“加载中图标”
				// Upload.dataUrl作用是从file对象中获取blob
				_.map(files, function (file) {
					Upload.dataUrl(file).then(function (blob) {
						var fileNameLast = _.get(file.name.match(/^.+\.(\w+)$/), 1);
						var medium = {
							file: blob,
							fileName: file.name,
							fileNameLast: fileNameLast,
							isImage: false,
							src: '',
							_id: '',
							uploadStatus: 'uploading',
							active: false,
							edited: false
						};
						switch (fileNameLast) {
							case 'jpg':
							case 'jpeg':
							case 'png':
							case 'gif':
							medium.isImage = true;
						}
						scope.media.push(medium);
					});
				});
				// eachLimit:async中数组的迭代方法，第一个参数为要迭代的数组，第二个参数为并发数限制，第三个参数为迭代函数
				// 要注意迭代函数中一定要调用callback，才会继续下一次迭代
				// 第四个参数为函数等迭代完成后执行，该函数的参数为迭代函数中callback传递的参数
				async.eachLimit(files, 3, function (file, callback) {
					Upload.upload({
						url: '/api/media',
						data: { file: file }
					}).then(function (res) {
						//success
						var data = res.data;
						_.map(scope.media, function (medium) {
							Upload.dataUrl(file).then(function (blob) {
								if ( medium.file === blob ) {
									medium._id = data._id;
									medium.src = data.src;
									medium.uploadStatus = 'success';
								}
							});
						});
						getMedia();
						callback(null);
					}, function (res) {
						//error
						callback(res);
					});
					// .progress(function (evt) {
					// 	//进度条
					// 	var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
					// 	console.log('progess:' + progressPercentage + '%' + evt.config.file.name);
					// }).success(function (data, status, headers, config) {
					// 	//上传成功
					// 	console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
					// 	$scope.uploadImg = data;
					// }).error(function (data, status, headers, config) {
					// 	//上传失败
					// 	console.log('error status: ' + status);
					// });
				}, function (err) {
					if (err) {
						notification.tip({
							type: 'danger',
							message: '上传缩略图失败'
						});
					}
				});
			};
			/**
			 * 移除媒体
			 */
			scope.removeMedia = function () {
				_.remove(scope.media, function(medium) { 
					return medium.active;
				});
				scope.disabledSelectViewRemove = true;
				scope.disabledSelectViewinsert = true;
				checkDisabledUploadThumbnail();
			};
			/**
			 * 插入媒体
			 */
			scope.addMedia = function () {
				_.map(scope.mediaStore, function (medium) {
					if (medium.active) {
						var inList = _.find(scope.media, function (_medium) {
							if (_medium._id === medium._id) {
								_medium.active = true;
								return _medium;
							}
						});
						if (!inList) {
							scope.media.unshift(medium);
						}
					}
				});
				var activeMedia = _(scope.media).filter(medium=>medium.active).map(medium=>{
					return _.pick(medium, ['_id', 'description', 'fileName', 'fileNameLast', 'isImage', 'src']);
				}).value();

				element.modal('hide');
				scope.callback(activeMedia);
				_.map(scope.media, function (medium) { medium.active = false });
				scope.disabledSelectViewRemove = true;
				scope.disabledSelectViewinsert = true;
			};
		}
	}
}]);