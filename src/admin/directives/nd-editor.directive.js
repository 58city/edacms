/**
 * ndEditor Directives
 * Markdown 编辑器
 * 官网：http://www.taufanaditya.com/bootstrap-markdown/
 * 难点：当前作用域的content数据，是如何被传递到父级作用域的？
 * 当前指令使用content属性把父级作用域的内容数据所在的变量绑定到当前作用域（即指令的作用域和父级作用域共享这个变量）
 * 无论是在哪个作用域改变这个变量的值，都会一起改变。
 */
angular.module('directives').directive('ndEditor',  ['$templateCache', '$timeout', '$filter', '$http', 'Upload',function ($templateCache, $timeout, $filter, $http, Upload) {
    return {
      	restrict: 'E',
      	template: $templateCache.get('editor.view.html'),
		scope: {
			content: '=',
			disabled: '=',
			rows: '=',
			height: '=',
			mediaModel: '='
		},
		link: function (scope, element, attr, ctrl) {
			'use strict';
			/**
			 * 初始化变量
			 */
			var markdownInstance = null;
			scope.disable_form = true;
			scope.videoSource = '';
			/**
			 * 插入视频
			 */
			scope.insertVideo = function () {
				// 获取插选择的文本和编辑器全部内容
				var selected = markdownInstance.getSelection();
				var content = markdownInstance.getContent();
				// 检测选择文本之前和之后是否有换行\n，没有则追加
				var isFirstN = /\n$/.test(content.substr(0, selected.start));
				var isLastN = /^\n/.test(content.substr(selected.end, content.length));
				var str = '';
				if (!isFirstN && selected.start !== 0 ) {
					str += '\n';
				}
				str += '\n' + scope.videoSource + '\n';
				if (!isLastN) {
					str += '\n';
				}
				// 使用生成的视频文本替换选择的文本，更新编辑器
				markdownInstance.replaceSelection(str);
				scope.content = markdownInstance.getContent();
				// 重新设置光标位置到插入的视频的后面（此处设置无效？？？）
				var newSelected = markdownInstance.getContent().length - (content.length - selected.end);
				markdownInstance.setSelection(newSelected, newSelected);
				// 隐藏模态框，并重置内容
				$('#videoInsert').modal('hide');
				scope.videoSource = '';
				scope.videoInsertForm.$setUntouched();	
			};
			/**
			 * 初始化编辑器
			 */
			$('#content').markdown({
				resize: 'vertical',
				iconlibrary: 'fa',
				language: 'zh',
				onShow: function (e) {
					markdownInstance = e;
				},
				buttons: [
					[   
						// 第一组按钮
						{},
						// 第二组按钮
						{
							data: [
								// 链接
								{},
								// 媒体库
								{
									name: 'cmdMedia',
									title: '媒体库',
									icon: { fa: 'fa fa-archive' },
									callback: function (e) {
										scope.mediaModel({}, function (activeMedia) {
											// 获取插选择的文本和编辑器全部内容
											var selected = e.getSelection();
											var content = e.getContent();
											// 检测选择文本之前和之后是否有换行\n
											var isFirstN = /\n$/.test(content.substr(0, selected.start));
											var isLastN = /^\n/.test(content.substr(selected.end, content.length));

											var str = '';
											if (activeMedia.length === 1) {
												// 设置图片替代文本或超链接文本，如果选择了文本则为选择的文本，否则为文件名称
												var alt = selected.text ? selected.text : activeMedia[0].fileName;
												// 如果为图片，则在图片前后追加换行，并设置alt,src,title
												if (activeMedia[0].isImage) {
													if (!isFirstN && selected.start !== 0) {
														str += '\n';
													}
													str += '\n![' + alt + '](' + encodeURI(activeMedia[0].src) + ' "' + activeMedia[0].fileName + '")\n';
													if (!isLastN) {
														str += '\n';
													}
												// 如果为其他，则生成超链接，并设置文本内容、href和title
												} else {
													str += '[' + alt + '](' + encodeURI(activeMedia[0].src) + ' "' + activeMedia[0].fileName + '")'
												}
											} else if (activeMedia.length > 1) {
												for (var i = 0; i < activeMedia.length; i++) {
													if (i === 0 && !isFirstN) {
														str += '\n';
													}
													if (activeMedia[i].isImage) {
														str += '\n![' + activeMedia[i].fileName + '](' + encodeURI(activeMedia[i].src) + ' "' + activeMedia[i].fileName + '")\n';
													} else {
														str += '\n[' + activeMedia[i].fileName + '](' + encodeURI(activeMedia[i].src) + ' "' + activeMedia[i].fileName + '")\n';
													}
													if (i === activeMedia.length - 1 && !isLastN) {
														str += '\n';
													}
												}
											}
											// 使用生成的图片或超链文本替换选择的文本
											e.replaceSelection(str);
											scope.content = e.getContent();
											// 重新设置光标位置到插入的媒体的后面（此处设置无效？？？）										
											// console.log(e.getContent().length)        获取最新内容的长度
											// console.log(content.length,selected.end)  取得原来选择文的本末尾位置与内容最后的距离
											var newSelected = e.getContent().length - (content.length - selected.end);
											e.setSelection(newSelected, newSelected);
										});
									}
								},
								// 视频
								{
									name: 'cmdVideo',
									title: '视频',
									hotkey: 'Ctrl+Alt+D',
									icon: { fa: 'fa fa-video-camera' },
									callback: function (e) {
										$('#videoInsert').modal('show');
									}
								}
							]
						}
					]
				]
			});
			scope.$watch('disabled', function () {
				$('#content').siblings('.btn-toolbar').find('button').prop('disabled', scope.disabled);
			});
			scope.$watch('height', function () {
				markdownInstance.$element[0].style.height=scope.height+'px';
			});
		}
    }
}]);