const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')

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
    new FaviconsWebpackPlugin({
        logo: './img/og-image.jpg',
        logoMaskable: './img/safari-pinned-tab.svg',
        mode: 'webapp',
        devMode: 'webapp',
        favicons: {
          appName: 'SCCS Course Planner',
          appDescription: 'My Swarthmore course schedule, proudly (or, at least, dutifully) planned with the SCCS Course Planner',
          developerName: 'SCCS',
          developerURL: 'https://www.sccs.swarthmore.edu/',
          background: '#da532c',
          theme_color: '#fff',
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
