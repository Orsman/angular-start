'use strict';

import gulp from 'gulp';
import del from 'del';
import babel from 'gulp-babel';
import rev from 'gulp-rev';
import sass from 'gulp-sass';
import eslint from 'gulp-eslint';
import concat from 'gulp-concat';
import uglify from 'gulp-uglify';
import inject from 'gulp-inject';
import minifyCSS from 'gulp-minify-css';
import ngAnnotate from 'gulp-ng-annotate';
import minifyHtml from 'gulp-minify-html';
import ngTemplateCache from 'gulp-angular-templatecache';

const appName = 'NAME OF APP';
const browserSync = require('browser-sync').create();
const vendorScripts = [
    './src/vendor/angular.min.js',
    './src/vendor/angular-animate.min.js',
    './src/vendor/angular-ui-router.min.js'
];

/**
 * @desc Grab all newly created files and inject
 * all of them into the new index.html
 */
function buildIndexHtml() {
    const buildSources = gulp.src([
        './build/vendor*.js',
        './build/app*.js',
        './build/templates*.js',
        './build/style*.css'
    ]);

    return gulp.src('./src/index.html')
        .pipe(inject(buildSources, {
            addRootSlash: false,
            ignorePath: 'build'
        }))
        .pipe(gulp.dest('./build'))
        .on('end', browserSync.reload);
}


gulp.task('vendor', () => {
  return del('./build/vendor*.js').then(() => {
    gulp.src(vendorScripts)
      .pipe(concat('vendor.js'))
      .pipe(rev())
      .pipe(gulp.dest('./build'))
      .on('end', buildIndexHtml);
  });
});


gulp.task('js', () => {
  return del('./build/app*.js').then(() => {
    gulp.src(['./src/config/app.module.js', './src/config/**/*.js', './src/shared/**/*.js', './src/pages/**/*.js'])
      .pipe(concat('app.js'))
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(eslint.failAfterError())
      .pipe(rev())
      .pipe(gulp.dest('./build'))
      .on('end', buildIndexHtml);
  });
});


gulp.task('sass', () => {
  return del('./build/style*.css').then(() => {
    gulp.src('./src/style/style.scss')
      .pipe(sass())
      .pipe(gulp.dest('./build'))
      .pipe(browserSync.stream());
  });
});

gulp.task('sass-init', () => {
  return del('./build/style*.css').then(() => {
    gulp.src('./src/style/style.scss')
      .pipe(sass())
      .pipe(gulp.dest('./build'))
      .on('end', buildIndexHtml);
  });
});

gulp.task('sass-prod', () => {
  return del('./build/style*.css').then(() => {
    gulp.src('./src/style/style.scss')
      .pipe(sass())
      .pipe(minifyCSS())
      .pipe(rev())
      .pipe(gulp.dest('./build'))
      .on('end', buildIndexHtml);
  });
});

/**
 * @desc Minify and create $templateCache from the html templates
 * When using minifyHtml I can make sure all comments the team has made in our
 * source code will not be pushed out to production.
 */
gulp.task('templates', () => {
  return del('./build/templates*.js').then(() => {
    gulp.src(['./src/pages/**/*.html', './src/shared/**/*.html'])
      .pipe(minifyHtml({
        empty: true,
        spare: true
      }))
      .pipe(ngTemplateCache({module: appName}))
      .pipe(rev()) // Add unique name
      .pipe(gulp.dest('./build'))
      .on('end', buildIndexHtml);
  });
});

gulp.task('watch', ['init'], () => {
    browserSync.init({
        server: "./build"
    });

  gulp.watch('./src/style/**/*.scss', ['sass']);
  gulp.watch(['./src/config/**/*.js', './src/shared/**/*.js', './src/pages/**/*.js'], ['js']);
  gulp.watch('./src/vendor/*.js', ['vendor']);
  gulp.watch(['./src/pages/**/*.html', './src/shared/**/*.html'], ['templates']);
});

gulp.task('init', ['vendor', 'js', 'templates', 'sass-init']);
gulp.task('prod', ['vendor', 'js', 'templates', 'sass-prod']);
