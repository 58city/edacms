/**
 * ndPagination Directives
 */
angular.module('directives').directive('ndPagination', ['$templateCache', function ($templateCache) {
    return {
      	restrict: 'E',
      	template: $templateCache.get('pagination.view.html'),
		scope: {
			pageData: '='
		},
      	link: function (scope, element, attrs) {
        	scope.pagesList = [];
        	scope.changePage = function () {
          		scope.pagesList = [];
				switch (true) {
					// 小于等于7页
					case scope.pageData.totalPages <= 7:
						for (var i = 0; i < scope.pageData.totalPages; i++) {
							scope.pagesList[i] = {
								name: i + 1,
								index: i + 1
							};
						}
					break;
					// 大于7页，且当前页小于等于3
					case scope.pageData.currentPage <= 3:
						scope.pagesList = [
							{ name: 1, index: 1 },
							{ name: 2, index: 2 },
							{ name: 3, index: 3 },
							{ name: 4, index: 4 },
							{ name: 5, index: 5 },
							{ name: 6, index: 6 },
							{ name: '...' + scope.pageData.totalPages, index: scope.pageData.totalPages }
						]
					break;
					// 大于7页，当前页大于3，且小于totalPages-3
					case scope.pageData.currentPage > 3 && scope.pageData.currentPage <= scope.pageData.totalPages - 3:
						scope.pagesList.push({ name: '1...', index: 1 });
						for (var i = scope.pageData.currentPage - 2; i <= scope.pageData.currentPage + 2; i++) {
							scope.pagesList.push({ name: i, index: i });
						}
						scope.pagesList.push({ name: '...' + scope.pageData.totalPages, index: scope.pageData.totalPages });
					break;
					// 大于7页，当前页位于最后3页
					case scope.pageData.currentPage > scope.pageData.totalPages - 3:
						scope.pagesList.push({ name: '1...', index: 1 });
						for (var i = scope.pageData.totalPages - 5; i <= scope.pageData.totalPages; i++) {
							scope.pagesList.push({ name: i, index: i });
						}
					break;
				}
         		$('body,html').scrollTop(0);
        	};
			scope.$watchGroup(['pageData.currentPage', 'pageData.totalPages'], function () {
				scope.changePage();
			});
      	}
    }
}]);