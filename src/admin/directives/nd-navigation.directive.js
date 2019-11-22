/**
 * ndNavigation Directives
 */
angular.module('directives').directive('ndNavigation', ['$templateCache', '$rootScope', '$http', '$filter', 'account','locals','notification',
  	function ($templateCache, $rootScope, $http, $filter, account,locals,notification) {
		/**
		 * return start
		 */
		return {
			restrict: 'E',
			template: $templateCache.get('navigation.view.html'),
			/**
			 * link start
			 */
			link: function (scope, element) {
				// 初始化变量
				scope.notFoundPages = false;
				scope.notFoundContents = false;
				scope.auth = {};
				scope.categories = [];
				scope.user = {};
				// 折叠或展开二级菜单，并记录展开状态
				scope.an=locals.getObject('anlist',{content:false,page:false,sys:false});
				scope.checkAn=function(menu){
					if(menu) {
						scope.an[menu]=!scope.an[menu];
						for(var key in scope.an){
							if(key==menu) continue;
							scope.an[key]=false;
						}
					}else{
						for(var key in scope.an) scope.an[key]=false;
					}
					locals.setObject('anlist',scope.an);
				}
				// 折叠或展开左侧菜单
				scope.minifyMenu=function(){
					var $body=angular.element('body');
					$body.toggleClass("minified");
					$body.removeClass("hidden-menu");
				}
				/**
				 * 读取用户权限列表
				 */
				function loadUser () {
					account.get().then(function (user) {
						scope.user = user;
					}, function () {
						notification.tip({
							type: 'danger',
							message: '读取用户失败'
						});
					});
					account.auths().then(function (auths) {
						scope.auths = auths;
					}, function () {
						notification.tip({
							type: 'danger',
							message: '读取权限失败'
						});						
					});
				}
				loadUser();
				/**
				 *读取栏目列表,并过滤掉频道和链接的分类，保留栏目和单页				
				 */
				scope.categoriesSort = function () {
					scope.categoriesSorted = [];
					function tree (callback) {
						var source = _.partition(scope.categories, function(category) {
							if (category.path) {
								return category.path.split('/').length === 2;
							} else {
								return category.mixed.prePath.split('/').length === 2;
							}
						});
						var categories = _.sortBy(source[0], 'sort');
						var otherCategories = source[1];
						function loop (parent,children) {
							return _.map(parent, function (p_cat) {
								var source = _.partition(children, function(c_cat) {
									if (c_cat.path) {
										return new RegExp('^' + p_cat.path + '/[A-z0-9\-\_]+$').test(c_cat.path);
									} else {
										return new RegExp('^' + p_cat.path + '/$').test(c_cat.mixed.prePath);
									}
								});
								if (!_.isEmpty(source[0])) {
									categories=_.sortBy(source[0], 'sort');
									otherCategories = source[1];
									p_cat.nodes = loop(categories,otherCategories);
								}
								return p_cat;
							});
						}
						var categories_tree = loop(categories,otherCategories);
						callback && callback(categories_tree);
					}
					tree(function (categories_tree) {
						(function loop (categories_tree, layer) {
							_.map(categories_tree, function (category, index) {
								category.indent = { 'text-indent': layer * 0.5 + 'em' };
								if (index == categories_tree.length - 1 && layer != 0) {
									category.prefix = '└ ';
								} else if (layer != 0) {
									category.prefix = '├ ';
								}
								scope.categoriesSorted.push(category);
								if (category.nodes) loop(category.nodes, layer + 1);
							});
						})(categories_tree, 0);
					});
				};
				function loadCategories () {
					$http.get('/api/categories').then(function (res) {
						var data = res.data;
						scope.categories=data;
						// scope.categories = $filter('filter')(data, function (value) {
						// 	if (value.type !== 'channel' && value.type !== 'link') {
						// 		return true;
						// 	}
						// });	
						scope.categoriesSort();
						if (!_.find(data, { type: 'page', mixed: { isEdit: true } })) {
							scope.notFoundPages = true;
						} else {
							scope.notFoundPages = false;
						}
						if (!_.find(data, { type: 'column' })) {
							scope.notFoundContents = true;
						} else {
							scope.notFoundContents = false;
						}
					});
				} 
				loadCategories();
				// 接收分类更新消息
				$rootScope.$on('mainCategoriesUpdate', function () {
					loadCategories();
				});
				// 接收用户更新消息
				$rootScope.$on('mainUserUpdate', function () {
					account.reset();
					loadUser();
				});
			}
			/**
			 * link end
			 */
		}
		/**
		 * return end
		 */
  	}
]);