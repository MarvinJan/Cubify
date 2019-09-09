const gulp = require("gulp");
const babel = require("gulp-babel");
const uglify = require("gulp-uglify");
const sass = require("gulp-sass");
const htmlmin = require("gulp-htmlmin");
const cleanCSS = require("gulp-clean-css");
const smushit = require("gulp-smushit");
const concat = require("gulp-concat");

gulp.task("minifyImg", () => {
  gulp
    .src("src/img/*")
    .pipe(smushit())
    .pipe(gulp.dest("public/img"));
  gulp.src("src/img/svg/*").pipe(gulp.dest("public/img/svg"));
});
function minifyImg() {
  return (
    gulp
      .src("src/img/*")
      .pipe(smushit())
      .pipe(gulp.dest("public/img")),
    gulp.src("src/img/skills/*").pipe(gulp.dest("public/img/skills")),
    gulp
      .src("src/img/svg/features/*")
      .pipe(gulp.dest("public/img/svg/features/"))
  );
}
function minifyJs() {
  return gulp
    .src("src/js/*.js")
    .pipe(
      babel({
        presets: [["env", { modules: false }]]
      })
    )
    .pipe(uglify())
    .pipe(gulp.dest("public/js"));
}
function minifyHtml() {
  return gulp
    .src("src/*.html")
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest("public/"));
}
function compileSass() {
  return gulp
    .src(["src/sass/styles.scss", "src/sass/*.scss"])
    .pipe(sass())
    .pipe(concat("styles.min.css"))
    .pipe(cleanCSS())
    .pipe(gulp.dest("public/css"));
}
gulp.task("default", done => {
  minifyImg();
  minifyHtml();
  minifyJs();
  compileSass();
  done();
});

gulp.task("watch:all", () => {
  gulp.watch("src/*.html", minifyHtml);
  gulp.watch("src/js/*.js", minifyJs);
  gulp.watch("src/sass/*.scss", compileSass);
});
