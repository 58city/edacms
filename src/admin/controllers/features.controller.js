/**
 * Features Controller
 */
angular.module('controllers').controller('features', ['$scope', '$rootScope', '$http', 'account','notification',function ($scope, $rootScope, $http, account,notification) {
    'use strict';
    /**
     * 初始化变量
     */
    $scope.disable_form = false;
    $scope.noFeatureModel = false;
    $scope.models = [];
    $scope.currentAuth = false;
	$scope.editAuth = false;
    /**
     * 读取用户编辑权限
     */
    account.auths().then(function (auths) {
        $scope.editAuth = auths.features.edit;
    }, function () {
		notification.tip({
			type: 'danger',
			message: '读取权限失败'
		});
    });
    /**
     * 读取内容模型列表
     */
    async.parallel({
		model: function (callback) {
			$http.get('/api/models',{params:{type:'feature'}}).then(function (res) {
				callback(null, res.data);
			}, function () {
				callback('读取推荐模型失败');
			});
		},
		features: function (callback) {
			$http.get('/api/features').then(function (res) {
				callback(null, res.data);
			}, function () {
				callback('读取推荐信息失败');
			});
		}
	}, function (err, results) {
		// 得到一个结果对象，类似{model:[{推荐位1},{推荐位2}...],features:[{推荐信息1},{推荐信息2}...]}
      	if (err) {
			notification.tip({
				type: 'danger',
				message: err
			});
			return false;
		}
		// 没有推荐位 
		if (_.isEmpty(results.model)) return $scope.noFeatureModel = true;
		// 把推荐信息映射到所属的推荐位上
		$scope.models = _.map(results.model, function (model) {
			model.features = _.filter(results.features, function (feature) {
				return feature.model === model._id;
			});
			return model;
		});
    });
    /**
     * 删除推荐信息
     */
    $scope.deleteFeature = function (mid,fid) {
		$scope.disable_form = true;
		notification.confirm({
			icon:'fa-trash-o txt-color-orangeDark',
			title:'删除推荐',
			message:'您确定要删除此条推荐吗？删除后不可再次恢复！',
			callback:function(){
				$http.delete('/api/features/' + fid).then(function (res) {
					var model = _.find($scope.models, { _id: mid });
					_.forEach(model.features, function (feature, index) {
						if (feature._id === fid) {
							model.features.splice(index, 1);
							return false;
						}
					});
					$scope.disable_form = false;
					notification.tip({
						type: 'success',
						message: '删除推荐成功'
					});
			  	}, function () {
					notification.tip({
						type: 'success',
						message: '删除推荐失败'
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