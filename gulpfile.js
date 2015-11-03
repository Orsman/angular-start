'use strict';

var appName = 'THE NAME OF YOUR APP';

var gulp                 = require('gulp'),
    del                  = require('del'),
    rev                  = require('gulp-rev'),
    less                 = require('gulp-less'),
    jscs                 = require('gulp-jscs'),
    jshint               = require('gulp-jshint'),
    concat               = require('gulp-concat'),
    uglify               = require('gulp-uglify'),
    inject               = require('gulp-inject'),
    minifyCSS            = require('gulp-minify-css'),
    ngAnnotate           = require('gulp-ng-annotate'),
    minifyHtml           = require('gulp-minify-html'),
    angularTemplateCache = require('gulp-angular-templatecache');

// Specify all the vendor scripts that need to be compiled and included in
// the app.
var vendorScripts = [
  './bower_components/angular/angular.min.js',
  './bower_components/angular-animate/angular-animate.min.js',
  './bower_components/angular-ui-router/release/angular-ui-router.min.js'
];

/**
 * @desc Grab all newly created files and inject
 * all of them into the new index.html
 */
function buildIndexHtml() {
  var sources = gulp.src([
      './build/vendor*.js',
      './build/app*.js',
      './build/templates*.js',
      './build/style*.css'
    ]);

  return gulp.src('./index.html')
    .pipe(inject(sources, {
      addRootSlash: false,
      ignorePath: 'build'
    }))
    .pipe(gulp.dest('./build'));
}

/**
 * @desc Minify and bundle the Vendor JS
 */
gulp.task('vendor', function() {
  return del('./build/vendor*.js').then(function() {
    gulp.src(vendorScripts)
      .pipe(concat('vendor.js'))
      .pipe(rev()) // Add unique name
      .pipe(gulp.dest('./build'))
      .on('end', buildIndexHtml);
  });
});

/**
 * @desc Minify and bundle the app's JavaScript
 */
gulp.task('js', function() {
  return del('./build/app*.js').then(function() {
    gulp.src(['./src/js/app.js', './src/js/*.js'])
      .pipe(jshint())
      .pipe(concat('app.js'))
      .pipe(rev()) // Add unique name
      .pipe(gulp.dest('./build'))
      .on('end', buildIndexHtml);
  });
});

/**
 * @desc Minify and bundle the app's CSS
 */
gulp.task('less', function() {
  return del('./build/style*.css').then(function() {
    gulp.src('./src/less/style.less')
      .pipe(less())
      .pipe(minifyCSS())
      .pipe(rev()) // Add unique name
      .pipe(gulp.dest('./build'))
      .on('end', buildIndexHtml);
  });
});

/**
 * @desc Minify and create $templateCache from the html templates
 * When using minifyHtml I can make sure all comments the team has made in our
 * source code will not be pushed out to production.
 */
gulp.task('templates', function() {
  return del('./build/templates*.js').then(function() {
    gulp.src('./src/templates/*.html')
      .pipe(minifyHtml({
        empty: true,
        spare: true
      }))
      .pipe(angularTemplateCache({module: appName}))
      .pipe(rev()) // Add unique name
      .pipe(gulp.dest('./build'))
      .on('end', buildIndexHtml);
  });
});

/**
 * @desc Watch files and build
 */
gulp.task('watch', function() {
  gulp.watch('./src/less/*.less', ['less']);
  gulp.watch('./src/js/**/*.js', ['js']);
  gulp.watch('./src/vendor/*.js', ['vendor']);
  gulp.watch('./src/templates/*.html', ['templates']);
});

/**
 * @desc Gulp init that will create all necessary files
 */
gulp.task('init', ['vendor', 'js', 'templates', 'less']);