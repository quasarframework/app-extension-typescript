/**
 * Quasar App Extension prompts script
 *
 * Inquirer prompts
 * (answers are available as "api.prompts" in the other scripts)
 * https://www.npmjs.com/package/inquirer#question
 *
 */

module.exports = function() {
  return [
    {
      name: 'packageManager',
      type: 'list',
      required: true,
      message: 'Please choose your package manager:',
      choices: [
        {
          name: 'NPM',
          value: 'npm'
        },
        {
          name: 'Yarn',
          value: 'yarn'
        }
      ]
    },
    {
      name: 'webpack',
      type: 'list',
      required: true,
      message: 'Please choose how to derive webpack:',
      choices: [
        {
          name:
            'Use the fork-ts-checker-webpack-plugin module for type-checking (recommended)',
          value: 'plugin'
        },
        {
          name: 'Use vanilla ts-loader',
          value: 'vanilla'
        }
      ]
    },
    {
      name: 'rename',
      type: 'confirm',
      required: true,
      message: 'Rename .js files to .ts (experimental)'
    },
    {
      name: 'vscode',
      type: 'confirm',
      required: true,
      message: 'Will you use VSCode for this project? (Adds ESLint and Vetur configuration quirks, you must manually install the extensions)'
    },
    {
      name: 'prettier',
      type: 'confirm',
      required: true,
      message: 'Generate prettier configuration (ESLint and VScode, if used)?'
    }
  ]
}
