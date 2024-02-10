const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

const WorkboxPlugin = require('workbox-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
});
