var gulp = require('gulp');
var gutil = require( 'gulp-util' );                        //常用小工具集合
var del = require('del');                                  //node模块，删除文件
var plumber = require( 'gulp-plumber' );                   //让gulp在能在编译发生错误时不终止进程，并且在代码修正后能自动重新编译
var less = require('gulp-less');                           //压缩 less
var minify = require('gulp-clean-css');                    //压缩 CSS
var autoprefixer = require('gulp-autoprefixer');           //给 CSS 增加前缀
var uglify = require('gulp-uglify');                       //压缩 Javascript
var concat = require('gulp-concat');                       //合并,“减少网络请求”
var templateCache = require('gulp-angular-templatecache'); //生成angular模板缓存文件
var livereload=require('gulp-livereload');                 //热更新
//var filter = require('gulp-filter');
//var changed = require('gulp-changed');



/**
 * 错误处理:哔~的一声响，我要抛异常
 */
function error (event) {
  	gutil.beep();
  	gutil.log(event);
}



/**
 * 清除 public/assets_admin
 */
gulp.task('clean', function(cb) {
  	return del(['./public/assets/admin/**/*'], cb);
});



/**
 * vendor css 源
 */
var vendorSrcCSS = [
    './src/admin/vendor/bootstrap/bootstrap.min.css',
  	'./src/admin/vendor/font-awersome-4.6.1/font-awesome.css',
  	'./src/admin/vendor/bootstrap-markdown-2.10.0/css/bootstrap-markdown.css',
  	'./src/admin/vendor/bootstrap-markdown-2.10.0/css/bootstrap-markdown-rewrite.css',
  	'./src/admin/vendor/bootstrap-datepicker-1.6.1/css/bootstrap-datepicker3.css',

    './src/admin/vendor/pace/themes/blue/pace-theme-minimal.css',
    './src/admin/vendor/smart-admin/smartadmin-animate.css',
    './src/admin/vendor/smart-admin/smartadmin-flag.css',
    './src/admin/vendor/smart-admin/smartadmin-layout.css',
    './src/admin/vendor/smart-admin/smartadmin-color.css',
	'./src/admin/vendor/smart-admin/smartadmin-notificaton.css',
	'./src/admin/vendor/smart-admin/smartadmin-widget.css'
];
/**
 * 开发模式合并 vendor css
 */
gulp.task('concat-vendor-css', ['clean'], function () {
  	return gulp.src(vendorSrcCSS)
    .pipe(autoprefixer({
      	browsers: ['last 2 versions'],
      	cascade: false
    }))
    .pipe(concat('vendor.css'))
    .pipe(gulp.dest('./public/assets/admin/'))
	// .pipe(livereload());
});
/**
 * 生产模式合并 vendor css
 */
gulp.task('concat-vendor-css-less', ['clean'], function () {
  	return gulp.src(vendorSrcCSS)
    .pipe(autoprefixer({
      	browsers: ['last 2 versions'],
      	cascade: false
    }))
    .pipe(concat('vendor.css'))
    .pipe(minify())
    .pipe(gulp.dest('./public/assets/admin/'));
});



/**
 * 开发模式编译 main css
 */
gulp.task('concat-admin-css', ['clean'], function () {
  	return gulp.src('./src/admin/less/import.less')
    .pipe(plumber({ errorHandler: error }))
    .pipe(less())
    .pipe(concat('main.css'))
    .pipe(autoprefixer({
      	browsers: ['last 2 versions'],
      	cascade: false
    }))
    .pipe(gulp.dest('./public/assets/admin/'))
	// .pipe(livereload());
});
/**
 * 生产模式编译 main css
 */
gulp.task('concat-admin-css-less', ['clean'], function () {
  	return gulp.src('./src/admin/less/import.less')
    .pipe(less())
    .pipe(concat('main.css'))
    .pipe(autoprefixer({
      	browsers: ['last 2 versions'],
      	cascade: false
    }))
    .pipe(minify())
    .pipe(gulp.dest('./public/assets/admin/'));
});



/**
 * vendor js 源
 */
var vendorSrcJS = [
  	'./src/admin/vendor/jquery-3.2.1/jquery-3.2.1.min.js',
  	'./src/admin/vendor/async-1.5.2/async.js',
  	'./src/admin/vendor/lodash-4.11.1/lodash.js',
    './src/admin/vendor/moment-2.13.0/moment.js',
    './src/admin/vendor/marked-0.3.5/marked.js',

    './src/admin/vendor/bootstrap/bootstrap.min.js',
    './src/admin/vendor/bootstrap-markdown-2.10.0/js/bootstrap-markdown.js',
    './src/admin/vendor/bootstrap-markdown-2.10.0/js/bootstrap-markdown.zh.js',
    './src/admin/vendor/bootstrap-datepicker-1.6.1/js/bootstrap-datepicker.js',
    './src/admin/vendor/bootstrap-datepicker-1.6.1/js/bootstrap-datepicker.zh-CN.js',
    
  	'./src/admin/vendor/angular-1.3.19/angular.js',
  	'./src/admin/vendor/angular-1.3.19/angular-animate.js',
  	'./src/admin/vendor/angular-cookie-4.1.0/angular-cookie.js',
  	'./src/admin/vendor/angular-ui-router-0.2.18/angular-ui-router.js',
  	'./src/admin/vendor/ng-file-upload-12.0.4/ng-file-upload-all.js',
	'./src/admin/vendor/angular-img-cropper-1.0.0/angular-img-cropper.js',
	
	'./src/admin/vendor/smart-admin/SmartNotification.js',
    './src/admin/vendor/smart-admin/SmartWidget.js',
    './src/admin/vendor/pace/pace.js',
    './src/admin/vendor/jquery.nicescroll-3.7.6/jquery.nicescroll.min.js'
];
/**
 * 开发模式合并 vendor js
 */
gulp.task('concat-vendor-js', ['clean'], function () {
  	return gulp.src(vendorSrcJS)
    .pipe(plumber({ errorHandler: error }))
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('./public/assets/admin/'))
	// .pipe(livereload());
});
/**
 * 生产模式合并 vendor js
 */
gulp.task('concat-vendor-js-less', ['clean'], function () {
  	return gulp.src(vendorSrcJS)
    .pipe(concat('vendor.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./public/assets/admin/'));
});



/**
 * 开发模式合并 main js
 */
gulp.task('concat-admin-js', ['clean'], function () {
  	return gulp.src(['./src/admin/main.js', './src/admin/controllers/*.js', './src/admin/services/*.js', './src/admin/directives/*.js', './src/admin/filters/*.js'])
    .pipe(plumber({ errorHandler: error }))
    .pipe(concat('main.js'))
    .pipe(gulp.dest('./public/assets/admin/'))
	// .pipe(livereload());
});
/**
 * 生产模式合并 main js
 */
gulp.task('concat-admin-js-less', ['clean'], function () {
  	return gulp.src(['./src/admin/main.js', './src/admin/controllers/*.js', './src/admin/services/*.js', './src/admin/directives/*.js', './src/admin/filters/*.js'])
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./public/assets/admin/'));
});



/**
 * 合并 admin views,生成angular模板缓存模块 view js
 */
gulp.task('concat-admin-views', function () {
  	return gulp.src('./src/admin/views/*.html')
    .pipe(templateCache({
      	module: 'views',
      	filename: 'views.js'
    }))
    .pipe(gulp.dest('public/assets/admin/'))
	// .pipe(livereload());
});



/**
 * 拷贝 src/admin/ 到 public/assets/admin/
 */
gulp.task('copy-admin-assets', ['clean'], function () {
  	return gulp.src(
  		[
		    './src/admin/index.html',
		    './src/admin/notInstalled.html',
		    './src/admin/images/**/*'
  		], 
  		{ base: './src/admin/' }
  	)
    .pipe(gulp.dest('./public/assets/admin/'))
	// .pipe(livereload());
});



/**
 * 拷贝 font-awersome fonts
 */
gulp.task('copy-admin-font-awersome-fonts', ['clean'], function () {
  	return gulp.src('./src/admin/vendor/font-awersome-4.6.1/fonts/*', 
  		{ base: './src/admin/vendor/font-awersome-4.6.1/' }
  	)
	.pipe(gulp.dest('./public/assets/admin/'))
	// .pipe(livereload());
});



/**
 * 开发模式监视文件
 */
gulp.task('watch-assets-admin', function () {
	// livereload.listen();
  	gulp.watch('./src/admin/**/*', [
  		'concat-vendor-css','concat-admin-css', 
  		'concat-vendor-js','concat-admin-js', 
  		'concat-admin-views', 
  		'copy-admin-assets','copy-admin-font-awersome-fonts'
  	],function(file){
        // livereload.changed(file.path);
	});
});


/**
 * 默认开发模式编译:gulp
 */
gulp.task('default', [
	'watch-assets-admin', 
	'concat-vendor-css','concat-admin-css', 
	'concat-vendor-js','concat-admin-js', 
	'concat-admin-views', 
	'copy-admin-assets','copy-admin-font-awersome-fonts'
]);
/**
 * 生产模式编译:gulp build
 */
gulp.task('build', [
	'concat-vendor-css-less','concat-admin-css-less', 
	'concat-vendor-js-less','concat-admin-js-less', 
	'concat-admin-views', 
	'copy-admin-assets', 'copy-admin-font-awersome-fonts'
]);