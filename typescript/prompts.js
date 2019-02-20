/**
 * Quasar App Extension prompts script
 *
 * Inquirer prompts
 * (answers are available as "api.prompts" in the other scripts)
 * https://www.npmjs.com/package/inquirer#question
 *
 */

module.exports = function () {
  return [
    {
      name: 'installType',
      type: 'list',
      required: true,
      message: 'Please choose how to install required babel rules:',
      choices: [
        {
          name: 'Overwrite babel.config.js and use additional .babelrc',
          value: 'simple'
        },
        {
          name: 'Do nothing, I will manage myself',
          value: 'full'
        }
      ]
    }
  ]
}
