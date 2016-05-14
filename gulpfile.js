var gulp = require('gulp');
var shell = require('gulp-shell');
var jade = require('gulp-jade');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var gulpif = require('gulp-if');
var notify = require('gulp-notify');
var plumber = require('gulp-plumber');
var imagemin = require('gulp-imagemin');
var uglify = require('gulp-uglify');
var filter = require('gulp-filter');
var pngquant = require('imagemin-pngquant');
var livereload = require('gulp-livereload');
var bowerFiles = require('main-bower-files');
var del = require('del');
var ghPages = require('gulp-gh-pages');
var cleanCSS = require('gulp-clean-css');
var fs = require('fs');

var content = './src/templates/content/bbarker.json';
var outputDir = 'builds/';
var env = process.env.NODE_ENV || 'development';

function isDevelopment() {
    return env === 'development';
}

gulp.task('jade', function () {
    var contentData = JSON.parse(fs.readFileSync(content));
    return gulp.src('src/templates/**/!(_)*.jade')
        .pipe(plumber())
        .pipe(
            gulpif(isDevelopment(),
                jade({
                    pretty: true,
                    locals: contentData
                }),
                jade({
                    pretty: false,
                    locals: contentData
                })
            ))
        .pipe(gulp.dest(outputDir + env))
        .pipe(notify({
            message: "<%= file.relative %> created successfuly",
            templateOptions: {
                date: new Date()
            }
        }))
        .pipe(livereload())
});

gulp.task('bowerFiles', function () {
    var jsFilter = filter('**/*.js', {restore: true});
    var cssFilter = filter('**/*.css', {restore: true});

    return gulp.src(bowerFiles(), {
            base: 'bower_components'
        })
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(jsFilter)
        .pipe(gulpif(!isDevelopment(), uglify()))
        .pipe(jsFilter.restore)
        .pipe(cssFilter)
        .pipe(gulpif(!isDevelopment(), cleanCSS()))
        .pipe(cssFilter.restore)
        .pipe(gulp.dest(outputDir + env + '/lib'))
        .pipe(notify({
            message: "<%= file.relative %> created successfuly",
            templateOptions: {
                date: new Date()
            }
        }))
        .pipe(livereload());
});

gulp.task('sass', function () {
    return gulp.src('src/sass/**/!(_)*.scss')
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(
            gulpif(isDevelopment(),
                sass({sourceComments: 'map'}),
                sass({outputStyle: 'compressed'})
            )
        )
        .pipe(gulp.dest(outputDir + env + '/css/'))
        .pipe(notify({
            message: "<%= file.relative %> created successfuly",
            templateOptions: {
                date: new Date()
            }
        }))
        .pipe(livereload())
});

gulp.task('images', function () {
    return gulp.src('src/assets/images/**/!(_)*.*')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(gulp.dest(outputDir + env + '/images/'))
        .pipe(notify({
            message: "<%= file.relative %> created successfuly",
            templateOptions: {
                date: new Date()
            }
        }))
        .pipe(livereload())
});

gulp.task('downloads', function () {
    return gulp.src('src/assets/downloads/**/!(_)*.*')
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(gulp.dest(outputDir + env + '/downloads/'))
        .pipe(notify({
            message: "<%= file.relative %> created successfuly",
            templateOptions: {
                date: new Date()
            }
        }))
        .pipe(livereload())
});

gulp.task('javascript', function () {
    return gulp.src('src/js/*.*')
        .pipe(plumber())
        .pipe(gulpif(!isDevelopment(), uglify()))
        .pipe(gulp.dest(outputDir + env + '/js/'))
        .pipe(notify({
            message: "<%= file.relative %> created successfuly",
            templateOptions: {
                date: new Date()
            }
        }))
        .pipe(livereload())
});

gulp.task('watch', function () {
    livereload.listen();
    gulp.watch('src/js/**/*.*', ['javascript']);
    gulp.watch('src/templates/**/*.*', ['jade']);
    gulp.watch('src/sass/**/*.scss', ['sass']);
    gulp.watch('bower_components/**/*.*', ['bowerFiles']);
    gulp.watch('src/assets/images/**/!(_)*.*', ['images']);
    gulp.watch('src/assets/downloads/**/!(_)*.*', ['downloads']);
});

gulp.task('git', shell.task([
    'git status',
    'git add .',
    'git commit -m \'Code Updated\'',
    'git push origin'
]));


gulp.task('deploy', function() {
    del(".project");

    return gulp.src(outputDir + 'production/**/*')
        .pipe(ghPages({
            branch: "master",
            remoteUrl: "https://github.com/ProjectBarks/ProjectBarks.github.io",
            cname: "brandonbarker.me"
        }));
});


gulp.task('prod', shell.task([
    'NODE_ENV=production gulp'
]));

gulp.task('default', ['bowerFiles', 'sass', 'jade', 'images', 'downloads', 'javascript', 'watch']);



