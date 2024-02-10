const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: {
    'app': './js/main.js',
    'service-worker': "./js/service-worker.js",
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, './dist'),
    publicPath: 'auto',
    clean: false, // trico_scraped.json
    hashFunction: "xxhash64"
  },
  plugins: [
    // Ironically for everything but favicons
    new FaviconsWebpackPlugin({
        logo: './img/logo-vec.svg',
        mode: 'standalone',
        devMode: 'webapp',
        manifest: './manifest.json',
        favicons: {
          icons: {
            favicons: false, // Don't gen favicons in favor of SCCS logo due to desktop appearance
            android: [ // Don't gen 36x36 or 48x48 for same reason, statically define in manifest
                "android-chrome-144x144.png",
                "android-chrome-192x192.png",
                "android-chrome-256x256.png",
                "android-chrome-384x384.png",
                "android-chrome-512x512.png",
                "android-chrome-72x72.png",
                "android-chrome-96x96.png"
              ],
          },
        }
      }),
    new HtmlWebpackPlugin({
        template: './index.html'
      }),
    new MiniCssExtractPlugin(),
    new CopyPlugin({
      patterns: [
        { from: "*.txt", to: "" },
        { from: "screenshots/*", to: "assets/" },
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader,'css-loader'],
      },
      {
        test: /\.(eot|svg|png|jpg|gif|ico)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        type: 'asset/resource',
        generator: {
            filename: '[name][ext]'
        },
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        type: 'asset/resource',
      },
      {
        test: /\.webmanifest$/i,
        use: 'webpack-webmanifest-loader',
        type: 'asset/resource',
      },
    ]
  },
  optimization: {
    minimizer: [
      '...',
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: [
            'default',
            {
              discardComments: { removeAll: true },
            },
          ],
        }
      }),
    ]
  },
}
