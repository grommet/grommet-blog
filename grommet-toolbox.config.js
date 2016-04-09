import path from 'path';

export default {
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
  webpack: {
    resolve: {
      root: [
        path.resolve(__dirname, './node_modules')
      ]
    }
  },
  alias: {
    'grommet/scss': path.resolve(__dirname, '../grommet/src/scss'),
    'grommet': path.resolve(__dirname, '../grommet/src/js')
  },
  devPreprocess: ['set-webpack-alias'],
  scsslint: true
};
