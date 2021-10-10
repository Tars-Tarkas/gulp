const fileinclude = require('gulp-file-include');

let project_folder="dist";
let source_folder="#src";

let path={
  build:{
    html: project_folder +"/",
    css: project_folder + "/css/",
    js: project_folder + "/js/",
    img: project_folder + "/img/",
    fonts: project_folder + "/fonts/",
  },
  src:{
    html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
    css: source_folder + "/scss/style.scss",
    js: source_folder + "/js/scrypt.js",
    img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
    fonts: source_folder + "/fonts/*.ttf",
  },
  watch:{
    html: source_folder +"/**/*.html",
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
    scss = require('gulp-sass')(require('sass'));

 function browserSync(params){
  browsersync.init({
    server: {
      baseDir: "./" + project_folder + "/"
    },
    port:3000,
    notify: false
  })
 }

 function html(){
   return src(path.src.html)
      .pipe(fileincludes())
      .pipe(dest(path.build.html))
      .pipe(browsersync.stream())
 }

 function css(){
   return src(path.src.css)
   .pipe(
     scss({
       outputStyle: "expanded"
     })
   )
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream())
 }

 function watchFiles(){
   gulp.watch([path.watch.html],html);
 }
 
function clean(){
  return del (path.clean);
}

 let build = gulp.series(clean, gulp.parallel(css, html));
 let watch = gulp.parallel(build,watchFiles,browserSync);

 exports.css = css;
 exports.html = html;
 exports.build = build;
 exports.watch = watch;
 exports.default = watch;
