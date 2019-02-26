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
    }
  ]
}
