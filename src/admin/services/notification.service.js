angular.module('services').factory('notification',[function () {
	return {        
		//接收通知
		tip: function (option) {
			var color='',icon='';
			if(option.type=='danger'){
				color='#C46A69';
				icon='fa fa-warning flash animated';
			}
			if(option.type=='warning'){
				color='#C79121';
				icon='fa fa-bell flash animated';
			}
			if(option.type=='success'){
				color='#739E73';
				icon='fa fa-check flash animated';
			}
			$.smallBox({
				title : '',
				content : option.message,
				color : color,
				icon : icon,
				timeout : 2000,
				sound_on:true,
				sound_path:'/assets/admin/images/sound/'
			});
		},        
		//确认提示
		confirm: function (option) {
			$.SmartMessageBox({
				title : '<i class="fa '+option.icon+'"></i> '+option.title+' ',
				content : option.message,
				buttons : '[取消][确定]',
				sound_on:true,
				sound_path:"/assets/admin/images/sound/"
			}, function(ButtonPressed) {
				if (ButtonPressed == "确定") {
					option.callback();
				}
				if (ButtonPressed == "取消") {
					if(option.cancel) option.cancel();
				}
			});
		},
		//重置插件
		reset:function(){
			SmartUnLoading();
		}
	}
}]);