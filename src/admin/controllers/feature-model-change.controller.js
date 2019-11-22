/**
 * Feature Model Change
 */
angular.module('controllers').controller('featureModelChange', ['$scope', '$state', '$stateParams', '$http','notification',function ($scope, $state, $stateParams, $http,notification) {
    'use strict';
    /**
     * 初始化变量
     */
    $scope.disable_form = true;
    $scope.action = 'create';
	$scope._id = $stateParams.model;
	$scope.keyType = [
		{name: '文本框',type: 'text'},
		{name: '数字框',type: 'number'},
		{name: '文本域',type: 'textarea'},
		{name: '下拉框',type: 'select'},
		{name: '媒体',type: 'media'}
    ];
	// 推荐模型基本字段
	$scope.system = {
		thumbnail: true,
		title: true,
		url: true
	};
    $scope.thumbnailSize = {
		width: 400,
		height: 300
	};
	$scope.extensions = [];
	$scope.name = '';
	$scope.callname = '';
    $scope.oldCallname = '';
    $scope.limit = 5;
    $scope.sort = 0;
    $scope.description = '';
	// 新增或修改的键的临时存储对象，点击“保存键”按钮，会把它转存到extensions字段
	$scope.keyFormAction = '';
	$scope.keyNonUnique = false;
    $scope.key = {
		key: '',
		name: '',
		type: 'text',
		select: [],
		description: '',
		mixed:{select: [],limit:4}
	};
    $scope.keyTypeSelect = {name: '',value: ''};
    $scope.keyTypeSelectOptInvalid = {name: true,value: true};
	
	$scope.keyIndex = '';
	/**
	 * 读取内容模型
	 */
	if ($stateParams.model) {
		$scope.disable_form = true;
		$scope.action = 'update';
		$http.get('/api/models/' + $stateParams.model).then(function (res) {
			var data = res.data;
			if (data) {
				$scope.system = data.system;
				if (data.system.thumbnail && data.mixed && data.mixed.thumbnailSize){
					$scope.thumbnailSize = data.mixed.thumbnailSize;
				} 
				$scope.extensions = data.extensions;
				$scope.name = data.name;
				$scope.callname = data.mixed.callname;
				$scope.oldCallname = angular.copy($scope.callname);
				$scope.limit = data.mixed.limit;
				$scope.description = data.description;
				$scope.disable_form = false;
			} else {
				$state.go('main.fetureModels')
			}
		}, function () {
			notification.tip({
				type: 'danger',
				message: '获取内容模型失败'
			});
		});
	} else {
		$scope.disable_form = false;
	}
	/**
     * 添加/修改键
     */
	var oldKeyName="";
	$scope.keyModel = function (key, $index) {
		if (key) {
			$scope.keyFormAction = 'edit';
			$scope.keyIndex = $index;
			$scope.key = angular.copy(key);
		} else {
			$scope.keyFormAction = 'add';
			$scope.keyForm.$setPristine();
			$scope.keyForm.$setUntouched();
			$scope.key = {key: '',name: '',type: 'text',description: '',mixed: {select: [],limit: 4}};
		}
		oldKeyName= key ? key.key : "";
		$('#keyModal').modal('show');
	};
	// 监测“键名”的变化，查看“键名”是否重复，设置keyNonUnique
    $scope.$watch('key.key', function () {
		$scope.keyNonUnique = false;
		for (var i = 0; i < $scope.extensions.length; i++) {
			if ($scope.key.key === $scope.extensions[i].key && $scope.key.key!=oldKeyName) {
				return $scope.keyNonUnique = true;
			}
		}
	});
	// 监测“下拉框”类型，名称和值输入框的变化，都不为空激活添加按钮
    $('#keyForm').on('input', '#keyTypeSelectOptName', function () {
        $scope.$apply(function () {
          	$scope.keyTypeSelectOptInvalid.name = false;
        });
    }).on('blur', '#keyTypeSelectOptName', function () {
        $scope.$apply(function () {
			if (!$scope.keyTypeSelect.name) $scope.keyTypeSelectOptInvalid.name = true;
        });
    }).on('input', '#keyTypeSelectOptValue', function () {
        $scope.$apply(function () {
          	$scope.keyTypeSelectOptInvalid.value = false;
        });
    }).on('blur', '#keyTypeSelectOptValue', function () {
        $scope.$apply(function () {
			if (!$scope.keyTypeSelect.value) $scope.keyTypeSelectOptInvalid.value = true;
        });
    });
	// 为类型为“下拉框”的键添加option 
    $scope.addKeyTypeSelectOpt = function () {
		$scope.key.mixed.select = $scope.key.mixed.select || [];
		$scope.key.mixed.select.push(angular.copy($scope.keyTypeSelect));
		// 重置
		$scope.keyTypeSelect = {name: '',value: ''};
		$scope.keyTypeSelectOptInvalid = {name: true,value: true};
		$scope.keyForm.keyTypeSelectOptName.$setUntouched();
		$scope.keyForm.keyTypeSelectOptValue.$setUntouched();
    };
	// 移除类型为“下拉框”的键的option
    $scope.deleteKeyTypeSelectOpt = function (index) {
      	$scope.key.mixed.select.splice(index, 1);
    };
    /**
     * 删除键
     */
    $scope.deleteKey = function (index) {
      	$scope.extensions.splice(index, 1);
    };
    /**
     * 保存键
     */
    $scope.saveKey = function () {
		switch ($scope.key.type) {
			case 'text':
			case 'number':
			case 'textarea':
				delete $scope.key.mixed.select;
				delete $scope.key.mixed.limit;
			break;
			case 'select':
				delete $scope.key.mixed.limit;
			break;
			case 'media':
				delete $scope.key.mixed.select;
			break;
		}
		if ($scope.keyFormAction === 'add') {
			$scope.extensions.push($scope.key);
		} else if ($scope.keyFormAction === 'edit') {
			$scope.extensions[$scope.keyIndex] = $scope.key;
		}
      	$('#keyModal').modal('hide');
    };
    /**
     * 保存推荐位模型
     */
    $scope.saveModel = function () {
		$scope.disable_form = true;
		var model = {
			type: 'feature',
			name: $scope.name,
			description: $scope.description,
			mixed: {
				callname: $scope.callname,
				limit: $scope.limit,
				sort: $scope.sort
			},
			system: $scope.system,
			extensions: $scope.extensions
		};
      	if ($scope.system.thumbnail) model.mixed.thumbnailSize = $scope.thumbnailSize;
      	if ($stateParams.model) {
        	model._id = $stateParams.model;
			$http.put('/api/models/' + $stateParams.model, model).success(function () {
				for (var i = 0; i < $scope.$parent.models.length; i++) {
					if (model._id === $scope.$parent.models[i]._id) {
						$scope.$parent.models[i] = model;
						notification.tip({
							type: 'success',
							message: '修改推荐位成功'
						});
						$scope.$emit('mainCategoriesUpdate');
						return $state.go('main.featureModels');
					}
				}
			}).error(function () {
				notification.tip({
					type: 'danger',
					message: '修改推荐位失败'
				});
			});
      	} else {
			$http.post('/api/models', model).success(function (result) {
				model._id = result._id;
				$scope.$parent.models.push(model);
				notification.tip({
					type: 'success',
					message: '新建推荐位成功'
				});
				$scope.$emit('mainCategoriesUpdate');
				$state.go('main.featureModels');
			}).error(function () {
				notification.tip({
					type: 'danger',
					message: '新建推荐位失败'
				});
			});
      	}
    };
}]);