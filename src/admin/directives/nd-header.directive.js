angular.module('directives').directive('ndHeader', ['$templateCache', '$state', '$http','account','notification', 'ipCookie', function ($templateCache, $state, $http,account,notification,ipCookie) {
    return {
        restrict:'E',
        template:$templateCache.get("header.view.html"),
        link:function(scope,element){
            scope.$html=angular.element('html');
            scope.$body=angular.element('body');
            /**
             *退出
             */
            scope.logout=function(){
                var admin=angular.element(".login-info a span")[0].innerText;
                notification.confirm({
                    icon:'fa-sign-out txt-color-orangeDark',
                    title:'退出登录',
                    message:'亲爱的<span class="txt-color-orangeDark"><strong>'+admin+'</strong></span>您确定要退出本次登录吗 ?',
                    callback:function(){
                        $http.put('/api/account/sign-out').then(function (res) {
                            account.reset();
                            // 需要在此处清除cookie，否则手动在地址栏输入main路由，会产生先跳转到main页面，再回到登录页的bug
                            // 原因是路由跳转时，会先判断是否存在cookie，如果存在则跳转到main页面，而此时已经退出登录，但是cookie依旧存在，此为无效cookie
                            // 虽然cookie无效，但是依然会先到main页面，携带此cookie向服务器请求数据，服务器拒绝后由拦截器打回到登录页
                            // 清除cookie时需要指定path，否则删除不了。
                            ipCookie.remove('edacmsSid',{ path: '/' });
                            $state.go('signIn',{}, { reload:true });
                        }, function () {
                            notification.tip({
                                type: 'danger',
                                message: '退出登录失败'
                            });
                        });
                    }
                })
            }
            /**
             *全屏
             */
            scope.fullscreen=function(){
                if (!scope.$body.hasClass("full-screen")) {
                    scope.$body.addClass("full-screen");
                    if (document.documentElement.requestFullscreen) {
                        document.documentElement.requestFullscreen();
                    } else if (document.documentElement.mozRequestFullScreen) {
                        document.documentElement.mozRequestFullScreen();
                    } else if (document.documentElement.webkitRequestFullscreen) {
                        document.documentElement.webkitRequestFullscreen();
                    } else if (document.documentElement.msRequestFullscreen) {
                        document.documentElement.msRequestFullscreen();
                    }
                } else {	
                    scope.$body.removeClass("full-screen");	
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    } else if (document.mozCancelFullScreen) {
                        document.mozCancelFullScreen();
                    } else if (document.webkitExitFullscreen) {
                        document.webkitExitFullscreen();
                    }
                }
            }
            /**
             *折叠菜单
             */
            scope.toggleMenu=function(){
                scope.$body.toggleClass("hidden-menu");
                scope.$body.removeClass("minified");
            }
            /**
             *显示手机端搜索框
             */
            scope.show_search_m=function(){
                scope.$body.addClass('search-mobile');
            } 
            /**
             *隐藏手机端搜索框
             */
            scope.hide_search_m=function(){
                scope.$body.removeClass('search-mobile');
            } 
        }
    }
}])