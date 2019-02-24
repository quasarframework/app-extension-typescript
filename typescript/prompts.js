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
      name: 'rename',
      type: 'confirm',
      required: true,
      message: 'Rename .js files to .ts'
    }
  ]
}
