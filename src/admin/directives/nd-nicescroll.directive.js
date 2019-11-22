angular.module('directives').directive('ndNicescroll',['$rootScope',function($rootScope){
    return {
        restrict:'A',
        link:function(scope,element, attrs, controller){
            var niceOption = scope.$eval(attrs.niceOption);
            var niceScroll = $(element).niceScroll(niceOption);
            var flag=false;
            var nav=$('nav'),main=$('#main');
            $('.minifyme').click(function(e){
                flag=!flag;
                if(flag){
                    nav.getNiceScroll().remove();
                }else{
                    nav.niceScroll(niceOption);
                }  
            });
            // 展开导航菜单，重新计算 *导航菜单* 滚动条的高度
            $('#left-panel').on('click','nav ul li a',function(){
                if(nav.getNiceScroll(0)) nav.getNiceScroll(0).lazyResize(); 
            });
            // 路由切换成功，重新计算 *内容区域* 滚动条的高度
            $rootScope.$on('$stateChangeSuccess',function(){
                if(main.getNiceScroll(0)) main.getNiceScroll(0).lazyResize();
            });
            // 重新计算所有滚动条的高度
            $rootScope.$on('recalNiceScroll',function(){
                if(nav.getNiceScroll(0)) nav.getNiceScroll(0).lazyResize();
                if(main.getNiceScroll(0)) main.getNiceScroll(0).lazyResize(); 
            });
        }
    }
}])