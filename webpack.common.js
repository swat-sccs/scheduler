const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')
const WorkboxPlugin = require('workbox-webpack-plugin');

module.exports = {
  entry: [
    './js/main.js',
  ],
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, './dist'),
    publicPath: 'auto',
    clean: false, // trico_scraped.json
    hashFunction: "xxhash64"
  },
  plugins: [
    new WorkboxPlugin.GenerateSW({
        // these options encourage the ServiceWorkers to get in there fast
        // and not allow any straggling "old" SWs to hang around
        clientsClaim: true,
        skipWaiting: true,
      }),
    new FaviconsWebpackPlugin({
        logo: './img/logo.jpg',
        logoMaskable: './img/maskable.svg',
        mode: 'standalone',
        devMode: 'webapp',
        favicons: {
          appName: 'SCCS Course Planner',
          appDescription: 'My Swarthmore course schedule, proudly (or, at least, dutifully) planned with the SCCS Course Planner',
          developerName: 'SCCS',
          developerURL: 'https://www.sccs.swarthmore.edu/',
          background: '#f2f2f2',
          theme_color: '#31425f',
        }
      }),
    new HtmlWebpackPlugin({
        template: './index.html'
      }),
    new MiniCssExtractPlugin(),
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
