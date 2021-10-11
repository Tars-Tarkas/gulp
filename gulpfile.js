const fileinclude = require('gulp-file-include');

let project_folder = "dist"; // собранный проект
let source_folder = "#src"; // папка с исходниками
let fs = require('fs');

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
        fonts: source_folder + "/fonts/*.{ttf,otf,woff,woff2}",
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
    group_media = require("gulp-group-css-media-queries"), //сгрупировывает медиа запросы
    cleanCSS = require("gulp-clean-css"), //очищает стили
    rename = require("gulp-rename"),
    uglify = require("gulp-uglify-es").default, //сэимает  ЖиС код
    imagemin = require("gulp-imagemin"), // пережимает картинки
    webp = require("gulp-webp"), // конвертор в ВебП
    webphtml = require("gulp-webp-html"),
    webpcss = require("gulp-webpcss"),
    svgSprite = require("gulp-svg-sprite"), //собирает свг файлы
    ttf2woff = require("gulp-ttf2woff"), //конвертируем шрифты
    ttf2woff2 = require("gulp-ttf2woff2"), //конвертируем шрифты
    fonter = require("gulp-fonter"), //конвертируем из otf в ttf
    googleWebFonts = require("gulp-google-webfonts"); //качалка шрифтов с Гугла


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
        .pipe(webphtml())
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

    .pipe(webpcss())

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

function fonts() {
    src(path.src.fonts)
        .pipe(ttf2woff())
        .pipe(dest(path.build.fonts));
    return src(path.src.fonts)
        .pipe(ttf2woff2())
        .pipe(dest(path.build.fonts));
}

gulp.task('otf2ttf', function() { //ручной запуск
    return src([source_folder + '/fonts/*.otf'])
        .pipe(fonter({
            formats: ['ttf']
        }))
        .pipe(dest(source_folder + '/fonts/'));
})

function fontsStyle(params) { //подключение шрифтов

    let file_content = fs.readFileSync(source_folder + '/scss/fonts.scss');
    if (file_content == '') {
        fs.writeFile(source_folder + '/scss/fonts.scss', '', cb);
        return fs.readdir(path.build.fonts, function(err, items) {
            if (items) {
                let c_fontname;
                for (var i = 0; i < items.length; i++) {
                    let fontname = items[i].split('.');
                    fontname = fontname[0];
                    if (c_fontname != fontname) {
                        fs.appendFile(source_folder + '/scss/fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
                    }
                    c_fontname = fontname;
                }
            }
        })
    }
}

function cb() {}


var options = {
    fontsDir: 'fonts/',
    cssDir: 'fonts/',
    cssFilename: 'GoogleFonts.css'
};

gulp.task('fontsg', function() {
    return src([source_folder + '/fonts/fonts.list'])
        .pipe(googleWebFonts(options))
        .pipe(dest(source_folder));
});

//gulp.task('default', ['fontsg']);


/*
function testWebP(callback) { //JS-функция определения поддержки WebP
    var webP = new Image();
    webP.onload = webP.onerror = function() {
        callback(webP.height == 2);
    };
    webP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
}

testWebP(function(support) {
    if (support == true) {
        document.querySelector('body').classList.add('webp');
    } else {
        document.querySelector('body').classList.add('no-webp');
    }
});*/



function watchFiles() { //прослушка файлов на изменение и с последующим обновлением
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.img], images);
}

function clean() {
    return del(path.clean);
}

let build = gulp.series(clean, gulp.parallel(css, html, js, images, fonts), fontsStyle);
let watch = gulp.parallel(build, watchFiles, browserSync);


exports.html = html;
exports.css = css;
exports.js = js;
exports.images = images;
exports.fonts = fonts;
exports.fontsStyle = fontsStyle;
exports.build = build;
exports.watch = watch;
exports.default = watch;