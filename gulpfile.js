const fileinclude = require('gulp-file-include');

let project_folder = "dist";
let source_folder = "#src";

let path = {
    build: {
        html: project_folder + "/",
        css: project_folder + "/css/",
        js: project_folder + "/js/",
        img: project_folder + "/img/",
        fonts: project_folder + "/fonts/",
    },
    src: {
        html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
        css: source_folder + "/scss/style.scss",
        js: source_folder + "/js/scrypt.js",
        img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
        fonts: source_folder + "/fonts/*.ttf",
    },
    watch: {
        html: source_folder + "/**/*.html",
        css: source_folder + "/scss/**/*.scss",
        js: source_folder + "/js/**/*.js",
        img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
    },
    clean: "./" + project_folder + "/"
}

let { src, dest } = require('gulp'),
    gulp = require('gulp'),
    browsersync = require("browser-sync").create(),
    fileincludes = require("gulp-file-include"),
    del = require("del"),
    scss = require('gulp-sass')(require('sass')),
    autoPrefixer = require('gulp-autoprefixer'),
    group_media = require("gulp-group-css-media-queries"),
    cleanCSS = require("gulp-clean-css"),
    rename = require("gulp-rename"),
    uglify = require("gulp-uglify-es").default,
    imagemin = require("gulp-imagemin"),
    webp = require("gulp-webp");

function browserSync(params) {
    browsersync.init({
        server: {
            baseDir: "./" + project_folder + "/"
        },
        port: 3000,
        notify: false
    })
}

function html() {
    return src(path.src.html)
        .pipe(fileincludes())
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream())
}

function css() {
    return src(path.src.css)
        .pipe(fileincludes())
        .pipe(
            scss({
                outputStyle: "expanded"
            })
        )

    .pipe(autoPrefixer({
        cascade: true
    }))

    .pipe(group_media())

    .pipe(dest(path.build.css)) //выгружаем файл

    .pipe(cleanCSS()) // очищает

    .pipe(rename({
        extname: ".min.css" //переименовываем
    }))

    .pipe(dest(path.build.css)) // опять выгружает, но без двух операций сверху

    .pipe(browsersync.stream())
}

function js() {
    return src(path.src.js)
        .pipe(fileincludes())
        .pipe(dest(path.build.js)) //выгружаем файл
        .pipe(uglify())
        .pipe(rename({
            extname: ".min.js" //переименовываем
        }))
        .pipe(dest(path.build.js)) //выгружаем файл
        .pipe(browsersync.stream())
}

function images() {
    return src(path.src.img)
        .pipe(
            webp({
                quality: 70
            })
        )
        .pipe(dest(path.build.img))
        .pipe(src(path.src.img))
        .pipe(
            imagemin({
                progressive: true,
                svgPlugins: [{ removeViewBox: false }],
                interlaced: true,
                optimizationLevel: 3
            }))
        .pipe(dest(path.build.img))
        .pipe(browsersync.stream())
}

function watchFiles() { //прослушка файлов на изменение и с последующим обновлением
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.img], images);
}

function clean() {
    return del(path.clean);
}

let build = gulp.series(clean, gulp.parallel(css, html, js, images));
let watch = gulp.parallel(build, watchFiles, browserSync);


exports.html = html;
exports.css = css;
exports.js = js;
exports.images = images;
exports.build = build;
exports.watch = watch;
exports.default = watch;