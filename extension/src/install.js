/**
 * Quasar App Extension install script
 *
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/InstallAPI.js
 */
const execa = require('execa')

module.exports = async api => {
  // TODO we need a way to detect if ESLint was configured (maybe checking for .eslintrc.js? Or checking if ESLint dependency is present)
  // And if it is not, we must add it to the devDeps

  let devDependencies = {
    '@types/node': '11.9.5',
    '@typescript-eslint/eslint-plugin': '^1.12.0',
    '@typescript-eslint/parser': '^1.12.0',    
    typescript: '^3.3.3'
  }
  if(api.prompts.prettier) {
    devDependencies['eslint-config-prettier'] = '^6.0.0'
  }

  api.render('./templates/base', {}, true)
  api.extendPackageJson({
    scripts: {
      lint: 'eslint --ext .js,.ts,.vue --ignore-path .gitignore ./'
    },
    devDependencies
  })

  // TODO is there a way to automatically detect VSCode usage? Checking .vscode folder isn't a reliable indicator
  if (api.prompts.vscode) {
    const fs = require('fs')

    if (!fs.existsSync('.vscode')) {
      fs.mkdirSync('.vscode')
    }

    if (!fs.existsSync('.vscode/settings.json')) {
      fs.writeFileSync('.vscode/settings.json', '{}')
    }

    api.extendJsonFile('.vscode/settings.json', {
      'vetur.experimental.templateInterpolationService': true,
      'vetur.validation.template': false,
      'eslint.validate': [
        'javascript',
        'javascriptreact',
        'typescript',
        { language: 'vue', autoFix: true }
      ]
    })

    if (!fs.existsSync('.vscode/extensions.json')) {
      fs.writeFileSync('.vscode/extensions.json', '{}')
    }

    api.extendJsonFile('.vscode/extensions.json', {
      recommendations: [
        'esbenp.prettier-vscode',
        'dbaeumer.vscode-eslint',
        'octref.vetur'
      ],
      unwantedRecommendations: [
        'hookyqr.beautify',
        'dbaeumer.jshint',
        'ms-vscode.vscode-typescript-tslint-plugin'
      ]
    })
  }

  if (api.prompts.prettier) {    
    api.render('./templates/prettier')
  } else {
    api.render('./templates/noprettier')    
  }

  if (api.prompts.rename) {
    const util = require('util');
    const glob = util.promisify(require('glob'))
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

    // List of files that export Vue instance
    const vueComponentScriptFiles = []

    const vueFiles = await glob(api.resolve.app('src/**/*.vue'))
    vueFiles.forEach(file => {
      const fileDir = path.parse(file).dir
      let text = fs.readFileSync(file, 'utf8')

      text = text.replace(/<script.*>/, tag => {
        tag = tag.replace(/lang="(js|javascript)" ?/, '')
        tag = tag.replace(/src="(.*)\.js"/, (tag, fileName) => {
          // Record that file exports a Vue instance
          vueComponentScriptFiles.push(path.join(fileDir, fileName + '.js'))
          return `src="${fileName}.ts"`
        })
        return tag.replace('<script', '<script lang="ts"')
      })
      // Allow type-inference in components
      text = text.replace(
        /export default {(.*)}(.*<\/script.*>)/s,
        (match, componentData, extra) =>
          `import Vue from 'vue'\n\nexport default Vue.extend({${componentData}})${extra}`
      )
      fs.writeFileSync(file, text)
    })

    const jsFiles = await glob(api.resolve.app('src/**/*.js'))

    jsFiles.forEach(file => {
      let text = fs.readFileSync(file, 'utf8')
      // Only change files that export a Vue instance
      if (vueComponentScriptFiles.includes(file)) {
        text = text.replace(
          /export default {(.*)}/s,
          (match, componentData) =>
            `import Vue from 'vue'\n\nexport default Vue.extend({${componentData}})`
        )
      }
      const newFile = path.parse(file)
      newFile.ext = '.ts'
      delete newFile.base
      // Write new file
      fs.writeFileSync(path.format(newFile), text)
      // Remove old file
      fs.unlinkSync(file)
    })

    try {
      const routesFilePath = api.resolve.app('./src/router/routes.ts')
      let routesFile = fs.readFileSync(routesFilePath, 'utf8')
      routesFile = `import { RouteConfig } from 'vue-router'\n` + routesFile
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
  }

  // TODO: detect if npm or yarn was used
  // TODO: some files need typings for theirs parameters (eg. axios and i18n boot files)
  execa('yarn').then(() =>
    execa('yarn', ['lint', '--fix']).catch(() => {
      // We'll always get some lint errors until we switch all files to ES6 syntax
      //  or programmatically add `eslint-env node` around and `eslint-disable-next-line` for
      //  problematic points
    })
  )
}
