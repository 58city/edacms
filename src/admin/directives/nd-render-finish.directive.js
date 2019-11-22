angular.module('directives').directive('ndRenderFinish',['$timeout',function($timeout){
    return {
        restrict: 'A',
        link: function(scope, element, attr) {
            if (scope.$last === true) {
                // $timeout(function() {
                //     scope.$emit('ngRenderFinish');
                // });
                var fun=$scope.$eval(attrs.ndRenderFinish);
                if(fun&&typeof(fun)=='function'){
                    fun();
                }
            }
        }
    };    
}])