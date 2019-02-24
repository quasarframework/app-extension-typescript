/**
 * Quasar App Extension index/runner script
 * (runs on each dev/build)
 *
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/IndexAPI.js
 */

module.exports = function(api, ctx) {
  api.chainWebpack((chain, invoke) => {
    const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
    chain.resolve.extensions.add('.ts').add('.tsx')
    chain.module
      .rule('typescript')
      .test(/\.tsx?$/)
      .use('typescript')
      .loader('ts-loader')
      .options({
        appendTsSuffixTo: [/\.vue$/],
        // Type checking is handled by fork-ts-checker-webpack-plugin
        transpileOnly: true
      })
    chain.plugin('ts-checker').use(ForkTsCheckerWebpackPlugin, [{ vue: true }])
  })
}
