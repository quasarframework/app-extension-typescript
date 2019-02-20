/**
 * Quasar App Extension index/runner script
 * (runs on each dev/build)
 *
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/IndexAPI.js
 */

module.exports = function (api, ctx) {
  api.chainWebpack((chain, invoke) => {
    chain.resolve
      .extensions
        .add('.ts')
    chain.module
      .rule('typescript')
        .test(/\.tsx?$/)
        .use('typescript')
          .loader('ts-loader')
          .options({
            appendTsSuffixTo: [/\.vue$/]
          })
  })
}
