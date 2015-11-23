var gulp = require('gulp');
var eslint = require('gulp-eslint');

gulp.task('static', function() {
	'use strict';
	return gulp.src(['*.js', 'src/**/*.js'])
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failOnError());
});

gulp.task('default', ['static']);
