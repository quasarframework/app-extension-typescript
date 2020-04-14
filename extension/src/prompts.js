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
      name: 'codeUpdate',
      type: 'confirm',
      required: true,
      message:
        "Update code where possible (use this only if you're using code versioning and will be able to rollback)"
    },
    {
      name: 'componentStyle',
      type: 'list',
      required: true,
      message: 'Pick a component style:',
      choices: [
        {
          name:
            'Composition API (recommended) (https://github.com/vuejs/composition-api)',
          value: 'composition'
        },
        {
          name:
            'Class-based (recommended) (https://github.com/vuejs/vue-class-component & https://github.com/kaorun343/vue-property-decorator)',
          value: 'class'
        },
        {
          name: 'None (keep old Object API)',
          value: 'object'
        }
      ]
    },
    {
      name: 'vscode',
      type: 'confirm',
      required: true,
      message:
        'Will you use VSCode for this project? (Adds ESLint and Vetur configuration quirks, you must manually install the extensions)'
    },
    {
      name: 'prettier',
      type: 'confirm',
      required: true,
      message: 'Generate prettier configuration (ESLint and VScode, if used)?'
    }
  ]
}
