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
            // Allow type-inference in components
            text = text.replace(
              /export default {(.*)}/s,
              (match, componentData) =>
                `import Vue from 'vue'\nexport default Vue.extend({${componentData}})`
            )
            fs.writeFileSync(file, text)
          })
          try {
            const routesFilePath = api.resolve.app('./src/router/routes.ts')
            let routesFile = fs.readFileSync(routesFilePath, 'utf8')
            routesFile = `import { RouteConfig } from 'vue-router'` + routesFile
            routesFile = routesFile.replace(
              'const routes = [',
              'const routes: RouteConfig[] = ['
            )
            fs.writeFileSync(routesFilePath, routesFile)
          } catch (e) {
            console.log('Could not add types to routes.ts')
          }
          try {
            const routerFilePath = api.resolve.app('./src/router/index.ts')
            let routerFile = fs.readFileSync(routerFilePath, 'utf8')
            routerFile = routerFile.replace(
              'scrollBehavior: () => ({ y: 0 }),',
              'scrollBehavior: () => ({ y: 0, x: 0 }),'
            )
            fs.writeFileSync(routerFilePath, routerFile)
          } catch (e) {
            console.log('Could not add types to router.ts')
          }
          resolve()
        })
      })
    }
  })
