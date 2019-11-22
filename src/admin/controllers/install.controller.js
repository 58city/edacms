/**
 * Install Controller
 */
angular.module('controllers').controller('install', ['$scope','$http', '$timeout',function ($scope,$http, $timeout) {
		'use strict';
		/**
		 * 初始化变量
		 */
		$scope.disable_form = false;
		$scope.page = 'license';
		$scope.databaseHost = '127.0.0.1';
		$scope.databasePort = 27017;
		$scope.database = 'edacms';
		$scope.databaseUser = '';
		$scope.databasePassword = '';
		$scope.databaseError = false;
		$scope.themes = [];
		$scope.theme = 'default';
		$scope.themeError = false;
		$scope.title = '';
		$scope.email = '';
		$scope.nickname = '';
		$scope.password = '';
		$scope.siteInfoError = false;
		$scope.hasInstall = false;
		$scope.installingTimeout = null;
		$scope.installingPoll = null;
		$scope.sponsor = 99;
		/**
		 * 读取主题
		 */
		$scope.loadThemes = function () {
			$http.get('/api/install/themes').then(function (res) {
				var data = res.data;
				$scope.themes = data;
				$scope.themeError = false;
			}, function () {
				$scope.themeError = true;
			});
		}; 
		$scope.loadThemes();
		/**
		 * 检查数据库连接
		 */
		$scope.testDatabase = function () {
			$scope.disable_form = true;
			var data = {
				host: $scope.databaseHost,
				port: $scope.databasePort,
				db: $scope.database,
				user: $scope.databaseUser,
				pass: $scope.databasePassword
			};
			$http.put('/api/install/test-database', data).then(function () {
				$scope.disable_form = false;
				$scope.databaseError = false;
				$scope.page = 'siteInfo';
			}, function () {
				$scope.disable_form = false;
				$scope.databaseError = true;
			});
		};
		/**
		 * 提交 install
		 */
		$scope.submitInstall = function () {
			$scope.disable_form = true;
			$scope.installing();
			var data = {
				databaseHost: $scope.databaseHost,
				databasePort: $scope.databasePort,
				database: $scope.database,
				databaseUser: $scope.databaseUser,
				databasePassword: $scope.databasePassword,
				title: $scope.title,
				theme: $scope.theme,
				email: $scope.email.toLowerCase(),
				nickname: $scope.nickname,
				password: $scope.password
			};
			$http.post('/api/install', data).then(function () {
				$scope.hasInstall = true;
			}, function () {
				if ($scope.installingTimeout) $timeout.cancel($scope.installingTimeout);
				if ($scope.installingPoll) $timeout.cancel($scope.installingPoll);
				$scope.disable_form = false;
				$scope.siteInfoError = true;
				$scope.page = 'siteInfo';
			});
		};
		$scope.installing = function () {
			$scope.page = 'installing';
			$scope.installingTimeout = $timeout(function poll() {
				if (!$scope.hasInstall) {
					$scope.installingPoll = $timeout(poll, 1000);
				} else {
					$scope.page = 'installed';
				}
			}, 1000);
		};
	}
]);