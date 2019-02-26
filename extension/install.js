/**
 * Quasar App Extension install script
 *
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/InstallAPI.js
 */
const execa = require('execa')

module.exports = api =>
  new Promise(resolve => {
    api.render('./templates/base', {}, true)
    api.extendPackageJson({
      devDependencies: {
        '@types/node': '11.9.5'
      }
    })
    // todo: detect if npm or yarn was used
    execa('yarn')

    if (api.prompts.rename) {
      const glob = require('glob')
      const fs = require('fs')
      const path = require('path')

      const quasarConfigPath = api.resolve.app('./quasar.conf.js')
      const replaceRegex = /module\.exports = function \((ctx)?\) {\n\s*return {/
      let quasarConfig = fs.readFileSync(quasarConfigPath, 'utf8')
      if (!replaceRegex.test(quasarConfig)) {
        console.log(`
We could not automatically update your quasar.conf.js to
use typescript. Quasar looks for *.js files by default.
Please add this to your quasar.conf.js:

sourceFiles: {
  router: 'src/router/index.ts',
  store: 'src/store/index.ts'
}
`)
      }
      quasarConfig = quasarConfig.replace(
        replaceRegex,
        `module.exports = function (ctx) {
  return {
    // Quasar looks for *.js files by default
    sourceFiles: {
      router: 'src/router/index.ts',
      store: 'src/store/index.ts'
    },`
      )
      fs.writeFileSync(quasarConfigPath, quasarConfig)

      glob(api.resolve.app('src/**/*.js'), (err, files) => {
        if (err) throw err
        files.forEach(file => {
          const newFile = path.parse(file)
          newFile.ext = '.ts'
          delete newFile.base
          fs.renameSync(file, path.format(newFile))
        })
        glob(api.resolve.app('src/**/*.vue'), (err, files) => {
          if (err) throw err
          files.forEach(file => {
            let text = fs.readFileSync(file, 'utf8')
            text = text.replace(/<script.*>/, tag => {
              tag = tag.replace(/lang=".{1,4}" ?/, '')
              return tag.replace('<script', '<script lang="ts"')
            })
            fs.writeFileSync(file, text)
          })
          resolve()
        })
      })
    }
  })
