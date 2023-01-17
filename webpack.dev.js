const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'source-map',
  devServer: {
    static: ['./dist/'],
    hot: true,
    watchFiles: ['js/*.js', 'css/*.css', '*.html'],
    liveReload: true,
    client: {
        progress: true,
        overlay: {
            errors: true,
            warnings: false,
        },
    },
  },
});
