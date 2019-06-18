// Gulp.js configuration
"use strict";

// Gulp and plugins
const { src, dest, series, parallel } = require("gulp");
const newer = require("gulp-newer");
const imagemin = require("gulp-imagemin");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const deporder = require("gulp-deporder");
const concat = require("gulp-concat");
const stripdebug = require("gulp-strip-debug");
const uglify = require("gulp-uglify");

const // source and build folders
  dir = {
    src: "./src/",
    build: "./wp-content/themes/mytheme/"
  };

// PHP settings
const phpConfig = {
  src: dir.src + "template/**/*.php",
  build: dir.build
};

// copy PHP files
function php() {
  return src(phpConfig.src)
    .pipe(newer(phpConfig.build))
    .pipe(dest(phpConfig.build));
}

// image settings
const imagesConfig = {
  src: dir.src + "images/**/*",
  build: dir.build + "images/"
};

// image processing
function images() {
  return src(imagesConfig.src)
    .pipe(newer(imagesConfig.build))
    .pipe(imagemin())
    .pipe(dest(imagesConfig.build));
}

// CSS settings
var cssConfig = {
  src: dir.src + "scss/style.scss",
  watch: dir.src + "scss/**/*",
  build: dir.build,
  sassOpts: {
    outputStyle: "nested",
    imagePath: images.build,
    precision: 3,
    errLogToConsole: true
  },
  processors: [
    require("postcss-assets")({
      loadPaths: ["images/"],
      basePath: dir.build,
      baseUrl: "/wp-content/themes/wptheme/"
    }),
    require("autoprefixer"),
    require("css-mqpacker"),
    require("cssnano")
  ]
};

// CSS processing
function css() {
  return src(cssConfig.src)
    .pipe(sass(cssConfig.sassOpts))
    .pipe(postcss(cssConfig.processors))
    .pipe(dest(cssConfig.build));
}

// JavaScript settings
const jsConfig = {
  src: dir.src + "js/**/*",
  build: dir.build + "js/",
  filename: "scripts.js"
};

// JavaScript processing
function js() {
  return src(jsConfig.src)
    .pipe(deporder())
    .pipe(concat(jsConfig.filename))
    .pipe(stripdebug())
    .pipe(uglify())
    .pipe(dest(jsConfig.build));
}

// run all tasks
const build = parallel(php, series(images, css), js);

// export tasks
exports.php = php;
exports.images = images;
exports.css = series(images, css);
exports.js = js;
exports.build = build;
exports.default = build;
