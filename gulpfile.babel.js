import gulp from'gulp';
import responsive from 'gulp-responsive';
import babelify from 'babelify';
import browserify from 'browserify';
import watchify from 'watchify';
import del from 'del';
import source from 'vinyl-source-stream';
import mergeStream from 'merge-stream';
import runSequence from 'run-sequence';

const browserSync = require('browser-sync').create();

/* Clean the distribution folder before building */
gulp.task('clean', (done) => {
	return del('./dist', done);
});

gulp.task('copy', () => {
	/* Copy CSS files */
	gulp.src('./src/css/*.css').pipe(gulp.dest('./dist/css/'));
	/* Copy HTML files */
	gulp.src('./src/*.html').pipe(gulp.dest('./dist/'));
	/* Copy App Icon files */
	gulp.src('./src/img/icons/*.png').pipe(gulp.dest('./dist/images/'));
	/* Copy Manifest file */
	gulp.src('./src/manifest.json').pipe(gulp.dest('./dist'));
});

/* Create Responsive Images from img directory */
gulp.task('responsive-images', () => {
	return gulp.src('src/img/*.jpg')
		.pipe(responsive({
			'*.jpg': [{
				width: 450,
				quality: 30,
				rename: { suffix: '-small' }
			}, {
				width: 600,
				quality: 30,
				rename: { suffix: '-medium' }
			}, {
				width: 800,
				quality: 30,
				rename: { suffix: '-large' }
			}]
		},))
		.pipe(gulp.dest('./dist/images'));
});

gulp.task('build', (done) => {
	return runSequence('clean', ['bundleJS', 'responsive-images'], 'copy', done)
});

/* JS Bundling Logic from Jake Archibald's Wittr Application Gulpfile
*  https://github.com/jakearchibald/wittr
 */
const createBundle = (src) => {
	if (!src.push) {
	  src = [src];
	}
  
	var customOpts = {
	  entries: src,
	  debug: true
	};

	var b = watchify(browserify(customOpts));
  
	b.transform("babelify", {presets: ["@babel/preset-env"]});
	return b;
};
  
const bundle = (b, outputPath) => {
	let splitPath = outputPath.split('/');
	let outputFile = splitPath[splitPath.length - 1];
	let outputDir = splitPath.slice(0, -1).join('/');
  
	return b.bundle()
	  .on('error', (err) => console.log(err))
	  .pipe(source(outputFile))
	  .pipe(gulp.dest('./dist/' + outputDir))
	  .pipe(browserSync.stream());
};
  
const jsBundles = {
	'js/main.js': createBundle('./src/js/main.js'),
	'js/restaurant.js': createBundle('./src/js/restaurant_info.js'),
	'sw.js': createBundle('./src/sw.js')
};
  
gulp.task('bundleJS', function () {
	return mergeStream.apply(null,
	  Object.keys(jsBundles).map(function(key) {
		return bundle(jsBundles[key], key);
	  })
	);
});

gulp.task('dev', ['build'], () => {
	browserSync.init({
		port: 8080,
		server: { baseDir: './dist' }
	});

	gulp.watch('./src/img/*.jpg', ['responsive-images']).on('change', browserSync.reload);
	gulp.watch('./src/*.html', ['copy']).on('change', browserSync.reload);
	
	Object.keys(jsBundles).forEach(function(key) {
		var b = jsBundles[key];
		b.on('update', function() {
		  return bundle(b, key);
		});
	  });
});

gulp.task('default', ['build'], () => {
	browserSync.init({
		port: 8080,
		server: { baseDir: './dist' }
	});
});