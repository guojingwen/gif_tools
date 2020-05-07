const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  filenameHashing: false,
  publicPath: process.env.NODE_ENV === 'production'
    ? '/gif_demo/'
    : '/',
  configureWebpack: {
    plugins: [
      new CopyWebpackPlugin([{
        from: 'src/static',
        to: 'static'
      }])
    ]
  }
}