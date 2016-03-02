var gulp = require('gulp');
var path = require('path');
var argv = require('argv');
var devGulpTasks = require('grommet/utils/gulp/gulp-tasks');

var opts = {
  copyAssets: [
    'src/index.html',
    {
      asset: 'src/img/**',
      dist: 'dist/img/'
    },
    {
      asset: 'node_modules/grommet/img/shortcut-icon.png',
      dist: 'dist/img/'
    },
    {
      asset: 'node_modules/grommet/img/mobile-app-icon.png',
      dist: 'dist/img/'
    }
  ],
  jsAssets: ['src/js/**/*.js'],
  mainJs: 'src/js/index.js',
  mainScss: 'src/scss/index.scss',
  devServerPort: 9070,
  devServerProxy: {
    "/api/post/*": 'http://localhost:8070'
  },
  alias: {
    'grommet/scss': path.resolve(__dirname, '../grommet/src/scss'),
    'grommet': path.resolve(__dirname, '../grommet/src/js')
  },
  devPreprocess: ['set-webpack-alias'],
  scsslint: true,
  customEslintPath: path.resolve(__dirname, 'customEslintrc'),
};

gulp.task('set-webpack-alias', function () {
  if (opts.alias && argv.useAlias) {
    console.log('Using local alias for development.');
    opts.webpack.resolve.alias = opts.alias;
  }
});

devGulpTasks(gulp, opts);
