const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    static: ['./'],
    hot: true,
    watchFiles: ['js/*/js', 'css/*.css', '*.html'],
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
