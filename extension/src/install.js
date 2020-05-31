/**
 * Quasar App Extension install script
 *
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/InstallAPI.js
 */
const execa = require('execa')
const fs = require('fs')
const path = require('path')

function abort(message) {
  throw new Error(message + ', aborting TS upgrade')
}

function extendPackageJson(api) {
  const dependencies = {
    quasar: '^1.9.15',
    ...(api.prompts.componentStyle === 'composition'
      ? { '@vue/composition-api': '^0.5.0' }
      : {}),
    ...(api.prompts.componentStyle === 'class'
      ? { 'vue-class-component': '^7.2.2', 'vue-property-decorator': '^8.3.0' }
      : {}),
  }

  const devDependencies = {
    '@quasar/app': '^1.7.1',
    '@types/node': '^10.17.15',
    '@typescript-eslint/eslint-plugin': '^2.22.0',
    '@typescript-eslint/parser': '^2.22.0',
    'eslint-plugin-vue': '^6.2.1',
    ...(api.prompts.prettier ? { 'eslint-config-prettier': '^6.10.0' } : {}),
    ...(!api.hasPackage('eslint', '>=6') ? { eslint: '^6.8.0' } : {}),
  }

  api.extendPackageJson({
    dependencies,
    devDependencies,
    scripts: {
      lint: 'eslint --ext .js,.ts,.vue --ignore-path .gitignore ./',
    },
  })
}

function vsCodeConfiguration(api) {
  if (!fs.existsSync('.vscode')) {
    fs.mkdirSync('.vscode')
  }

  if (!fs.existsSync('.vscode/settings.json')) {
    fs.writeFileSync('.vscode/settings.json', '{}')
  }

  api.extendJsonFile('.vscode/settings.json', {
    'vetur.experimental.templateInterpolationService': true,
    'vetur.validation.template': false,
    'eslint.validate': ['javascript', 'javascriptreact', 'typescript', 'vue'],
    'typescript.tsdk': 'node_modules/typescript/lib',
    ...(api.prompts.prettier ? { 'vetur.format.enable': false } : {}),
  })

  if (!fs.existsSync('.vscode/extensions.json')) {
    fs.writeFileSync('.vscode/extensions.json', '{}')
  }

  api.extendJsonFile('.vscode/extensions.json', {
    recommendations: [
      ...(api.prompts.prettier ? ['esbenp.prettier-vscode'] : []),
      'dbaeumer.vscode-eslint',
      'octref.vetur',
    ],
    unwantedRecommendations: [
      'hookyqr.beautify',
      'dbaeumer.jshint',
      'ms-vscode.vscode-typescript-tslint-plugin',
    ],
  })
}

function addConfigureHelper(quasarConfigText) {
  // We immediately return if configure() helper is already there
  if (quasarConfigText.includes('module.exports = configure')) {
    return quasarConfigText
  }

  const replaceRegex = /module\.exports = function/

  if (!replaceRegex.test(quasarConfigText)) {
    abort('could not find default exported function')
  }

  quasarConfigText = quasarConfigText.replace(
    replaceRegex,
    `const { configure } = require('quasar/wrappers');\n\nmodule.exports = configure(function`
  )

  index = 1
  while (quasarConfigText[quasarConfigText.length - index] !== '}') {
    index++
  }

  // Adds the closing `configure()` parenthesis, removing the ending semicolon if present
  quasarConfigText =
    (quasarConfigText[quasarConfigText.length - index + 1] === ';'
      ? quasarConfigText.slice(0, -index + 1)
      : quasarConfigText) + ')'

  return quasarConfigText
}

function addSupportTSFlag(quasarConfigText) {
  // We immediately return if "supportTS" options is already enabled
  if (quasarConfigText.includes('supportTS')) {
    return quasarConfigText
  }

  const replaceRegex = /return {/

  if (!replaceRegex.test(quasarConfigText)) {
    abort('could not find configuration return statement')
  }

  return quasarConfigText.replace(
    replaceRegex,
    `return {
    // https://quasar.dev/quasar-cli/cli-documentation/supporting-ts
    supportTS: {
      enable: true,
      tsCheckerConfig: { eslint: true }
    },
    `
  )
}

function disableBuildLintingOnDev(quasarConfigText) {
  // Get eslint-loader rule addition code, while avoiding all preceding and succeeding rules additions
  const replaceRegex = /cfg\.module\.rules\.push\({(?!.*?cfg\.module\.rules\.push.*?cfg\.module\.rules\.push.*?).*?eslint-loader.*?}\);/s

  return quasarConfigText.replace(
    replaceRegex,
    (match) => `if (process.env.NODE_ENV === 'production') {\n${match}\n}`
  )
}

function addBootHelper(api) {
  const bootFolder = api.resolve.src('boot')
  const bootFiles = fs
    .readdirSync(bootFolder)
    .map((fileName) => path.join(bootFolder, fileName))
    // Excludes '.gitkeep' and subfolders
    .filter((path) => fs.lstatSync(path).isFile() && !path.endsWith('.gitkeep'))

  for (const bootFile of bootFiles) {
    let bootFileContent = fs.readFileSync(bootFile, 'utf8')

    if (!bootFileContent.includes(`declare module 'vue/types/vue' {`)) {
      if (bootFile.includes('boot/axios')) {
        bootFileContent = bootFileContent.replace(
          'export default',
          `declare module 'vue/types/vue' {\ninterface Vue {\ni18n: VueI18n;\n}\n}\n\nexport default`
        )
      }

      if (bootFile.includes('boot/i18n')) {
        bootFileContent = bootFileContent.replace(
          'export default',
          `import { AxiosInstance } from 'axios';\n\ndeclare module 'vue/types/vue' {\ninterface Vue {\n$axios: AxiosInstance;\n}\n}\n\nexport default`
        )
      }
    }

    // We skip the file if boot() helper is already there or if no function is returned
    if (
      bootFileContent.includes('export default boot') ||
      !bootFileContent.includes('export default')
    ) {
      continue
    }

    bootFileContent =
      bootFileContent.replace(
        'export default',
        `import { boot } from 'quasar/wrappers';\n\nexport default boot(`
      ) + ')'

    fs.writeFileSync(bootFile, bootFileContent)
  }
}

function addRouteHelper(api) {
  const routerFilePath = api.resolve.src('./router/index.js')
  let routerFileContent = fs.readFileSync(routerFilePath, 'utf8')

  // We skip the file if route() helper is already there or if no function is returned
  if (
    routerFileContent.includes('export default route') ||
    !routerFileContent.includes('export default')
  ) {
    return
  }

  routerFileContent =
    routerFileContent.replace(
      'export default',
      `import { route } from 'quasar/wrappers';\n\nexport default route(`
    ) + ')'

  fs.writeFileSync(routerFilePath, routerFileContent)
}

function addStoreHelper(api) {
  const storeFilePath = api.resolve.src('./store/index.js')
  // We skip the update if store hasn't been used
  if (!fs.existsSync(storeFilePath)) {
    return
  }

  let storeFileContent = fs.readFileSync(storeFilePath, 'utf8')

  // We skip the file if route() helper is already there or if no function is returned
  if (
    storeFileContent.includes('export default store') ||
    !storeFileContent.includes('export default')
  ) {
    return
  }

  storeFileContent =
    storeFileContent.replace(
      'export default',
      `import { store } from 'quasar/wrappers';\n\nexport default store(`
    ) + ')'

  fs.writeFileSync(storeFilePath, storeFileContent)
}

async function updateCode(api) {
  const util = require('util')
  const glob = util.promisify(require('glob'))

  const quasarConfigPath = api.resolve.app('./quasar.conf.js')
  let quasarConfigText = fs.readFileSync(quasarConfigPath, 'utf8')

  quasarConfigText = addConfigureHelper(quasarConfigText)
  quasarConfigText = addSupportTSFlag(quasarConfigText)
  quasarConfigText = disableBuildLintingOnDev(quasarConfigText)

  fs.writeFileSync(quasarConfigPath, quasarConfigText)

  addBootHelper(api)
  addRouteHelper(api)
  addStoreHelper(api)

  // List of files that export Vue instance
  const vueComponentScriptFiles = []
  // We cannot transform object API into class API,
  //  so we just wrap those into Object wrapper functions
  const wrapperFunction =
    api.prompts.componentStyle === 'composition'
      ? `import { defineComponent } from '@vue/composition-api'\n\nexport default defineComponent`
      : `import Vue from 'vue'\n\nexport default Vue.extend`

  const vueFiles = await glob(api.resolve.app('src/**/*.vue'))
  vueFiles.forEach((file) => {
    const fileDir = path.parse(file).dir
    let text = fs.readFileSync(file, 'utf8')

    text = text.replace(/<script.*>/, (tag) => {
      tag = tag.replace(/lang="(js|javascript|ts)" ?/, '')
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
        `${wrapperFunction}({${componentData}})${extra}`
    )
    fs.writeFileSync(file, text)
  })

  const jsFiles = await glob(api.resolve.app('src/**/*.js'))

  jsFiles.forEach((file) => {
    let text = fs.readFileSync(file, 'utf8')
    // Only change files that export a Vue instance
    if (vueComponentScriptFiles.includes(file)) {
      text = text.replace(
        /export default {(.*)}/s,
        (match, componentData) => `${wrapperFunction}({${componentData}})`
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
    console.log('Could not add types to index.ts')
  }
}

module.exports = async (api) => {
  api.compatibleWith('quasar', '>=1.0.0')
  api.compatibleWith('@quasar/app', '>=1.0.0')

  api.render('./templates/base', {
    useClassComponentStyle: api.prompts.componentStyle === 'class',
    withPrettier: api.prompts.prettier,
  })

  extendPackageJson(api)

  if (api.prompts.vscode) {
    vsCodeConfiguration(api)
  }

  if (api.prompts.prettier) {
    api.render('./templates/prettier')
  }

  if (api.prompts.componentStyle === 'composition') {
    api.render(`./templates/composition-api`)
  } else if (api.prompts.componentStyle === 'class') {
    api.render(`./templates/class-api`)
  }

  if (api.prompts.codeUpdate) {
    await updateCode(api)
  }

  // We are sure @quasar/app is there because the AE system works only when it is present
  const nodePackager = require('@quasar/app/lib/helpers/node-packager')

  console.log('Installing dependencies...')
  await execa(nodePackager, 'install')

  // We'll always get some lint errors until we switch all files to ES6 syntax
  //  or programmatically add `eslint-env node` around and `eslint-disable-next-line` for
  //  problematic points
  try {
    console.log('Running linter...')
    await execa(
      nodePackager,
      (nodePackager === 'npm' ? ['run'] : []).concat(['lint', '--fix'])
    )
    console.log('Linter fixed all possible problems')
  } catch (e) {
    console.log(
      "Linter found some errors which wasn'n able to automatically fix, please fix them manually"
    )
  }

  // TODO: for some reason, calling quasar cli into here prevents render commands to take place
  // console.log(
  //   "@quasar/typescript AE will now uninstall its dependency because it's no longer needed"
  // )
  // await execa('quasar', ['ext', 'remove', '@quasar/typescript'])
  // console.log('@quasar/typescript AE succesfully uninstalled its dependency!')
}
