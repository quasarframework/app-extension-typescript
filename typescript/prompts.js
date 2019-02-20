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
      message: 'Please choose how to install typescript:',
      choices: [
        {
          name: 'JS & TS (permit both)',
          value: 'mixed',
          default: true
        },
        {
          name: 'Only Typescript (',
          value: 'full'
        }
      ]
    }
  ]
}
