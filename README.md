<!-- This file is duplicated into '/extension' to make it visible on NPM publication -->

# quasar-app-extension-typescript

> ### WARNING
>
> This extension will bring you in sync with Quasar + TS setup as of `quasar@1.9.x` and `@quasar/app@1.6.x`
>
> This extension is DEPRECATED and is only meant to ease the transition of pre-existing codebases. For new projects use starter-kit `TypeScript` option by installing `@quasar/cli` and running `quasar create <project-name>`
>
> Check out the [official documentation](https://quasar.dev/quasar-cli/installation).
>
> ESLint configuration will be overwritten, only Prettier flavour is supported out-of-the-box.
> `airbnb` and `default` configuration should be manually merged using your previous `.eslintrc.js` or one generated when creating a new Quasar project.
>
> You need to remove this extension and `typescript` dependency after a successful installation: the extension will only do the migration and there's no point into keeping it after that, while `typescript` dependency is already provided by `@quasar/app`
>
> **This extension is one-shot and does not provide uninstall script, make sure you've some form of version control in place to perform rollbacks**

Add TypeScript to your Quasar project (won't work for 0.x Quasar versions).

For simpler cases, just running this extension will do the job.

For the majority of cases, many tweaks on your side will be needed to fix type or linting issues, take some time when trying the migration.

If you don't trust a software to automatically update your code, you can manually update your project following the [official documentation](https://quasar.dev/quasar-cli/cli-documentation/supporting-ts#Installation-of-TypeScript-Support).

## Installation

Add the app extension to your project:

```shell
$ quasar ext add @quasar/typescript
```

To test the various build types, cd into test-extension and:

```
$ yarn
$ quasar ext invoke @quasar/typescript
```

## Fallback

If you experience problems you cannot understand or resolve, copy your `src` folder (and any project specific configuration) into a freshly created project with `TypeScript` option enabled.
Then proceed to manually update your files to use TypeScript.

To create a new project, run `quasar create <your project name>` using the global Quasar CLI and enable the `TypeScript` option.
