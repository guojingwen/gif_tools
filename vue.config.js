const CopyWebpackPlugin = require('copy-webpack-plugin')
module.exports = {
  filenameHashing: false,
  configureWebpack: {
    plugins: [
      new CopyWebpackPlugin([{
        from: 'src/static',
        to: 'static'
      }])
    ]
  }
}