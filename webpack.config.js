const path = require('path')

module.exports = {
  entry: './js/main.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  }, 
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['css-loader'],
      }
    ]
  },
}