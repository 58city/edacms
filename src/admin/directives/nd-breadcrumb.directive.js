angular.module('directives').directive('ndBreadcrumb',['$templateCache','$rootScope','$state','$http','$location','notification',function($templateCache,$rootScope,$state,$http,$location,notification){
    return {
        restrict:'E',
        template:$templateCache.get('breadcrumb.view.html'),
        link:function(scope,element){
            /**
             *清空缓存
             */
            scope.resetWidgets=function(){
                notification.confirm({
                    icon:'fa-refresh txt-color-greenDark',
                    title:'清空缓存',
                    message:'您确定要清空缓存吗，此操作会重置所有窗口设置?',
                    callback:function(){
                        location.reload();
                    }
                });
            }
            /**
             *实现面包屑导航
             */
            scope.menuType =[
                {zh_name: '控制面板',type: 'main'},
                {zh_name: '推荐管理',type: 'features'},
                {zh_name: '内容管理',type: 'contents'},
                {zh_name: '内容管理',type: 'notFoundContents'},
                {zh_name: '回收站',type: 'trash'},
                {zh_name: '单页管理',type: 'pages'},
                {zh_name: '单页管理',type: 'notFoundPages'},
                {zh_name: '媒体库',type: 'media'},
                {zh_name: '账号设置',type: 'account'},
                {zh_name: '系统设置',type: 'setting'},
                {zh_name: '网站配置',type: 'siteInfo'},
                {zh_name: '内容分类',type: 'categories'},
                {zh_name: '内容模型',type: 'contentModels'},
                {zh_name: '推荐模型',type: 'featureModels'},
                {zh_name: '权限角色',type: 'roles'},
                {zh_name: '后台用户',type: 'adminUsers'},
                {zh_name: '新增',type: 'create'},
                {zh_name: '修改',type: 'update'}
            ];
            function getStateArr(state_name,params){
                scope.routes=[];
                state_name.split('.').forEach(function(item){
                    scope.routes.push({en_name:item});
                });
                if(scope.routes.length>1) scope.routes.shift();
                if(params.category||params.page){
                    var id=params.category||params.page;
                    var url='/api/categories/'+id;
                }else if(params.model){
                    var id=params.model;
                    var url='/api/models/'+id;
                }else{
                    return false;
                }
                $http.get(url).then(function (res) {
                    scope.menuType.push({zh_name:res.data.name,type:res.data._id});
                    scope.routes.push({en_name:res.data._id});
                    angular.forEach(scope.routes,function(item,index){
                        if(item.en_name=='create' || item.en_name=='update'){
                            var el=scope.routes.splice(index,1)[0];
                            scope.routes.push(el);
                        }
                    });
                });
            }
            getStateArr($state.current.name,$state.params);
            $rootScope.$on('$stateChangeSuccess',function(evt,toState,toParams,fromState,fromParams){
                if(toState.name=="signIn") return;
                getStateArr(toState.name,toParams);
            });
        }
    }
}])