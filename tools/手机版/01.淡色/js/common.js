$(function(){
		
	$('.mores .m-tab').click(function(){
		$('.mores .m-list').toggle();
	})
	$('.mores .m-tabhiden').click(function(){
		$('.mores .m-list').toggle();
	})
	//搜索显示
	$('.search .txt').focus(function(){
		$('.search').css({'background':'#303A45'})
		$('.search form').css({'width':'73%'});
		$('header .logo').css({'z-index':'0'});
		$('.close_search').show();
	})
	$('.search .txt').blur(function(){
		$('header .logo').css({'z-index':'1000'});
		$('.search').css({'background':'none'})
		$('.search form').css({'width':'50%'});
		$('.close_search').hide();
	})
	$('.close_search').click(function(){
		$('.search').css({'background':'none'})
		$('.search form').css({'width':'50%'});
		$(this).hide();
	})
	$(".tucao .left img").css("marginTop",($(".tucao").height()-100)/2+'px')
	$(".guessLikeTab a").each(function(k){
		$(this).click(function(){
			$(this).addClass('cur').siblings('a').removeClass('cur').parent().siblings('ul').eq(k).show().siblings('ul').hide();
		})
	})
	//导航展开显示
	$('.menu_btn').click(function(){
		$(this).toggleClass('menu_on');
		$(this).find('span').toggle();
		$('div.menu').toggle();
	})
	
	$(".tucao .left img").css("marginTop",($(".tucao").height()-100)/2+'px')
	$(".guessLikeTab a").each(function(k){
		$(this).click(function(){
			$(this).addClass('cur').siblings('a').removeClass('cur').parent().siblings('ul').eq(k).show().siblings('ul').hide();
		})
	})
	$(".ptxt i").each(function(){
		$(this).click(function(){
			$(this).toggleClass('show').siblings('span:visible').hide().siblings('span').show();
			
		})
	})
	$(".pTab a").each(function(q){
		$(this).click(function(){
			$(this).addClass('cur').siblings().removeClass('cur');
			$('div.numList').eq(q).show().siblings('div.numList').hide();
		})
	})
	$(".cat").click(function(){
		$(this).find('i').toggleClass('moreArrow');
		$('.hiddenav').toggle();
	})
	$(".tablist").each(function(){
		$(this).find('li:gt(4)').hide();
		$(this).find('a.aMoreArrow').click(function(){
			$(this).find('i').toggleClass("moreshowicon");
			if($(this).find('i').attr('class') == 'moreshowicon'){
				$(this).siblings().children().show();
			} else {
				$(this).siblings('ul').find("li:gt(4)").hide();
			}
		})
	})
	
	$("div.sbox").each(function(){
		var curindex = $(this).find("a.selected").index();
		if(curindex<5){
			$(this).find("a:gt(4)").hide();
		}else{
			$(this).find("a.show").hide();
		}
		$(this).find("a.show").click(function(){
			$(this).hide().siblings("a").show();
		})
		$(this).find("a.hide").click(function(){
			$(this).hide().siblings('a.show').show().parent('div').find("a:gt(4)").hide();
		})
	})
	
	$("div.nbox").each(function(){
		var curindex = $(this).find("a.selected").index();
		if(curindex<4){
			$(this).find("a:gt(3)").hide();
		}else{
			$(this).find("a.show").hide();
		}
		$(this).find("a.show").click(function(){
			$(this).hide().siblings("a").show();
		})
		$(this).find("a.hide").click(function(){
			$(this).hide().siblings('a.show').show().parent('div').find("a:gt(3)").hide();
		})
	})
	$("div.pagenav").hide();
	$("div.search a.menu").click(function(){
		$("div.pagenav").toggle();
		$("div.pagewrap").toggleClass("showpage");
		$("div.sowrap").toggleClass("showpage");
	})
	
	$("p.des span.showdes").click(function(){
		$('span.moredes').show().siblings('span.lessdes').hide();
	})
	$("p.des span.hidedes").click(function(){
		$('span.lessdes').show().siblings('span.moredes').hide();
	})
	$("div.datelist span").each(function(i){
		$(this).click(function(){
			$(this).addClass('selected').siblings('span').removeClass('selected').parents('div#date').siblings('div.urllist').find("ul").eq(i).show().siblings("ul").hide();
		})
	})
	TouchSlide({ 
		slideCell:"#focus",
		titCell:".hd ul", //开启自动分页 autoPage:true ，此时设置 titCell 为导航元素包裹层
		mainCell:".bd ul", 
		effect:"left", 
		autoPlay:true,//自动播放
		autoPage:true, //自动分页
		switchLoad:"_src" //切换加载，真实图片路径为"_src" 
	});
	var gotoTop = {
		fixed: "#costom",
		id: "#gotop",
		clickMe : function(){
			$('html,body').animate({scrollTop : '0px'},{ duration:500});
		},
		toggleMe : function() {
			if($(window).scrollTop() == 0) {
				$(this.fixed).stop().animate({'opacity': 0}, "slow");
			} else {
				$(this.fixed).stop().animate({'opacity': 1}, "slow");
			}
		},
		init : function() {
			$(this.fixed).css('opacity', 0);
			$(this.id).click(function(){
				gotoTop.clickMe();
				return false;
			});
			$(window).bind('scroll resize', function(){
				gotoTop.toggleMe();
			});
		}
	};
	gotoTop.init();
	var Scroll = new iScroll('first_list',{hScroll:true, vScroll:false,hScrollbar:false, vScrollbar:false});
	var Scroll = new iScroll('third_list',{hScroll:true, vScroll:false,hScrollbar:false, vScrollbar:false});
	var Scroll = new iScroll('second_list',{hScroll:true, vScroll:false,hScrollbar:false, vScrollbar:false});
	var Scroll = new iScroll('four_list',{hScroll:true, vScroll:false,hScrollbar:false, vScrollbar:false});
	var Scroll = new iScroll('five_list',{hScroll:true, vScroll:false,hScrollbar:false, vScrollbar:false});
	var Scroll = new iScroll('six_list',{hScroll:true, vScroll:false,hScrollbar:false, vScrollbar:false});
})