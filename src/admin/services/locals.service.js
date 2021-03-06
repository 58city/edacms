angular.module('services').factory('locals',['$window', function ($window) {
    return {        
        //存储单个属性
        set: function (key, value) {
            $window.localStorage[key] = value;
        },        
        //读取单个属性
        get: function (key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        },        
        //存储对象，以JSON格式存储
        setObject: function (key, value) {
            $window.localStorage[key] = JSON.stringify(value);//将对象以字符串保存
        },        
        //读取对象
        getObject: function (key,defaultValue) {
            return JSON.parse($window.localStorage[key] || JSON.stringify(defaultValue));
        }
    }
}]);