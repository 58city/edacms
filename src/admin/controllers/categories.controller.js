/**
 * Categories Controller
 */
angular.module('controllers').controller('categories', ['$scope', '$http', 'account','notification',function ($scope, $http, account,notification) {
    'use strict';
    /**
     * 初始化变量
     */
	$scope.disable_form = false;
	$scope.pending = true;
	$scope.editAuth = false;
	$scope.types = [{type: 'channel',name: '频道'}, 
					{type: 'column',name: '栏目'},
					{type: 'page',name: '单页'}, 
					{type: 'link',name: '链接'}];
    $scope.categories = [];
    $scope.categoriesSorted = [];
    /**
     * 读取用户编辑权限
     */
    account.auths().then(function (auths) {
        $scope.editAuth = auths.categories.edit;
    }, function () {
        notification.tip({
          	type: 'danger',
          	message: '读取权限失败'
        });
	});
	/**
     * 获取分类
     */
    $http.get('/api/categories').then(function (res) {
        $scope.categories = res.data;
		$scope.categoriesSort();
		$scope.pending = false;
    }, function () {
        notification.tip({
          	type: 'danger',
          	message: '读取分类失败'
		});
		$scope.pending = false;
    });
    /**
     * 分类排序
	 */
    $scope.categoriesSort = function () {
		$scope.categoriesSorted = [];
		function tree (callback) {
			// _.partition：遍历集合，创建一个分成两组的数组元素，第一组包含返回为 true 的元素，第二组包含返回为 false 的元素
			// [[{},{}],[{},{}]]
			// 删选出来的数组第一部分为顶级目录，第二部分为其他级别目录
			var source = _.partition($scope.categories, function(category) {
				if (category.path) {
					return category.path.split('/').length === 2;
				} else {
					return category.mixed.prePath.split('/').length === 2;
				}
			});
			// _.sortBy:遍历集合，创建一个元素数组,以第二个参数处理的结果升序排序， 这个方法执行稳定排序，也就是说相同元素会保持原始排序。 
			// [{},{}]
			// 下面是对顶级目录，进行排序
			var categories = _.sortBy(source[0], 'sort');
			// 获取其他级别目录其他目录（包含二级、三级、四级）
			var otherCategories = source[1];
			function loop (parent,children) {
				// 遍历上级目录
				return _.map(parent, function (p_cat) {
					// 遍历其他目录，从所有其他目录中筛选出属于上级目录的下级目录，存储到数组里
					var source = _.partition(children, function(c_cat) {
						if (c_cat.path) {
							return new RegExp('^' + p_cat.path + '/[A-z0-9\-\_]+$').test(c_cat.path);
						} else {
							return new RegExp('^' + p_cat.path + '/$').test(c_cat.mixed.prePath);
						}
					});
					// 如果下级目录存在，则继续递归，并从其他目录中筛选出下级目录的子目录
					if (!_.isEmpty(source[0])) {
						categories=_.sortBy(source[0], 'sort');
						otherCategories = source[1];
						p_cat.nodes = loop(categories,otherCategories);
					}
					return p_cat;
				});
			}
			var categories_tree = loop(categories,otherCategories);
			callback(categories_tree);
		}
      	// 按树进行排序
		tree(function (categories_tree) {
			// 递归栏目
			(function loop (categories_tree, layer) {
				_.map(categories_tree, function (category, index) {
					// 栏目缩进
					category.indent = { 
						'text-indent': layer * 1.5 + 'em'
					};
					category.strong={
						'font-weight':layer==0?'bold':'normal',
						'color':layer==0?'#5cb85c':'#333'
					}
					// 栏目前缀,最后一个为‘└’，其他为‘├’
					if (index == categories_tree.length - 1 && layer != 0) {
						category.prefix = '└ ';
					} else if (layer != 0) {
						category.prefix = '├ ';
					}
					// PUSH当前栏目
					$scope.categoriesSorted.push(category);
					// 如果有子节点则递归
					if (category.nodes) loop(category.nodes, layer + 1);
				});
			})(categories_tree, 0);
		});
    };
    /**
     * 删除分类，及其子分类
     */
    $scope.deleteCategory = function (id) {
		$scope.disable_form = true;
		notification.confirm({
            icon:'fa-trash-o txt-color-orangeDark',
            title:'删除分类',
            message:'您确定要删除该分类？（包括所有子级分类以及内容）',
            callback:function(){
                $http.delete('/api/categories/' + id).then(function (res) {
					$scope.disable_form = false;
					_.forEach($scope.categories, function (category, i) {
						if (id === category._id) {
							// 从数组中删除本条分类
							$scope.categories.splice(i, 1);
							// 找到本条分类的子分类，一并删除
							var regex = new RegExp('^' + category.path + '/', 'i');
							_.forEachRight($scope.categories, function (category, i) {
								if (regex.test(category.path)) {
									$scope.categories.splice(i, 1);
								}
							});
							return false;
						}
					});
					$scope.categoriesSort();
					$scope.$emit('mainCategoriesUpdate');
					notification.tip({
						type: 'success',
						message: '删除分类成功'
					});
				},function () {
					$scope.disable_form = false;
					notification.tip({
						type: 'danger',
						message: '删除分类失败'
					});
				});
            },
            cancel:function(){
                $scope.$apply(function(){
                    $scope.disable_form = false;
                });
            }
        });
    };
}]);