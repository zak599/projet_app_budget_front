const gulp = require('gulp');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();

gulp.task('serve', () => {
    browserSync.init({
        server: './'
    });

    gulp.watch('**/*.html').on('change', browserSync.reload);
    gulp.watch('css/*.css').on('change', browserSync.reload);
    gulp.watch('js/*.js').on('change', gulp.series('app-js', browserSync.reload));
});

gulp.task('vendor-css', () => {
    return gulp.src([
        'node_modules/bootstrap/dist/css/bootstrap.min.css'
    ])
    .pipe(concat('vendor.css'))
    .pipe(gulp.dest('dist/css'))
});

gulp.task('app-css', () => {
    return gulp.src([
        'css/style.css',
    ])
    .pipe(concat('app.css'))
    .pipe(gulp.dest('dist/css'))
});


gulp.task('vendor-js', () => {
    return gulp.src([
        'node_modules/jquery/dist/jquery.min.js'
    ])
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('dist/js'))
});

gulp.task('app-js', () => {
    return gulp.src([
        'js/app.js',
        'js/home.js',
        'js/budget.js'
    ])
    .pipe(concat('app.js'))
    .pipe(gulp.dest('dist/js'))
});

gulp.task('dev', gulp.series('vendor-css', 'app-css', 'vendor-js', 'app-js', 'serve'));