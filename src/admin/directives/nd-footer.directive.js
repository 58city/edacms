angular.module('directives').directive('ndFooter',['$templateCache','$rootScope','$state','$timeout',function($templateCache,$rootScope,$state,$timeout){
    return {
        restrict:'E',
        template:$templateCache.get('footer.view.html'),
        link:function(scope,element){
            
        }
    }
}])