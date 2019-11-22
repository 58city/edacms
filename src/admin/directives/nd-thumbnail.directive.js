/**
 * ndThumbnail Directives
 * Thumbnail 上传组件
 */
angular.module('directives').directive('ndThumbnail',  ['$templateCache','Upload','base64ToBlobFile','notification',function ($templateCache,Upload,base64ToBlobFile,notification) {
	return {
		restrict: 'E',
		template: $templateCache.get('thumbnail.view.html'),
		scope: {
			thumbnail: '=',
			disabled: '=',
			width: '=',
			height: '='
		},
		link: function (scope, element, attrs, ctrl) {
			'use strict';
			/**
			 * 初始化变量
			 */
			scope.thumbnail = {
				file: null,
				sourceImage: '',
				_id: scope.thumbnail._id || null,
				croppedImage: scope.thumbnail.croppedImage || '',
				uploadStatus: scope.thumbnail.uploadStatus || 'initial'
			};
			scope.minWidth = scope.width / 2;
			scope.minHeight = scope.height / 2;
			/**
			 * 点击上传按钮
			 * @param files 文件对象数组
			 * [{
			 * 	 lastModified:1537597811471,
			 *   lastModifiedDate:Sat Sep 22 2018 14:30:11 GMT+0800 (中国标准时间),
			 *   name:"timg (1).jpg",
			 *   size:178596,
			 *   type:"image/jpeg",
			 *   webkitRelativePath:""
			 * }]
			 * 把提交上来的文件对象转换为blob数据，并转换为指向blob数据的url,此步之后：
			 * scope.thumbnail={
			 *     _id:null,croppedImage:"data:image/png;base64,...",uploadStatus:"initial",
			 *     sourceImage:"blob:http://localhost:3000/dad41444-ffce-4b3a-8b7c-6011347b8c1f",
			 *     file:File(54783)对象，里面比原始file对象多了$ngfBlobUrl字段
			 * }
			 */
			scope.cropThumbnail = function (files) {
				if (_.isEmpty(files)) return false;
				scope.thumbnail.file = files[0];
				Upload.dataUrl(scope.thumbnail.file).then(function (url) {
					scope.thumbnail.sourceImage = url;
					$('#corpModal').modal('show');
				});
			};
			/**
			 * 上传缩略图，上传时需要把裁剪后的base64格式图片，转换为blob数据
			 * •Blob URL的长度一般比较短，但Data URL因为直接存储图片base64编码后的数据，往往很长，如上图所示，浏览器在显示Data URL时使用了省略号（…）。当显示大图片时，使用Blob URL能获取更好的可能性。
			   •Blob URL可以方便的使用XMLHttpRequest获取源数据,比如设置XMLHttpRequest返回的数据类型为blob
			   •Blob URL 只能在当前应用内部使用，把Blob URL复制到浏览器的地址栏中，是无法获取数据的。Data URL相比之下，就有很好的移植性，可以在任意浏览器中使用。
			   •直接提交base64编码图片数据，过大的话后台会出现转发错误问题。
			 * 上传成功返回格式如下：
			 * {_id: "5c02b8caac1dc11704e6d110", src: "/media/201812/5c02b8caac1dc11704e6d110/timg (1).jpg"}
			 */
			scope.uploadThumbnail = function () {
				scope.thumbnail.uploadStatus = 'uploading';
				Upload.upload({
					url: '/api/media',
					data: { 
						file: base64ToBlobFile(scope.thumbnail.croppedImage, scope.thumbnail.file.name.replace(/\.\w+$/, '') + '.jpg', 'image/jpeg') 
					}
				}).then(function (res) {
					var data = res.data;
					scope.thumbnail.uploadStatus = 'success';
					scope.thumbnail._id = data._id;
				}, function () {
					notification.tip({
						type: 'danger',
						message: '缩略图上传失败'
					});
				});
				$('#corpModal').modal('hide');
			};
			/**
			 * 关闭裁剪窗后清空 $scope.thumbnail
			 */
			$('#corpModal').on('hide.bs.modal', function () {
		        // 需要判断，否则上传成功关闭窗口时，也会清空
				if (scope.thumbnail.uploadStatus === 'initial') {
					scope.$apply(function () {
						scope.thumbnail = {
							_id: null,
							file: null,
							sourceImage: '',
							croppedImage: '',
							uploadStatus: 'initial'
						};
					});
				}
			});
			/**
			 * 删除缩略图
			 */
			scope.removeThumbnail = function () {
				scope.thumbnail = {
					_id: null,
					file: null,
					sourceImage: '',
					croppedImage: '',
					uploadStatus: 'initial'
				};
			};
		}
	}
}]);