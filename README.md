# quasar-app-extension-typescript

> ### WARNING
>
> This extension will bring you in sync with Quasar + TS setup as of `quasar@1.9.x` and `@quasar/app@1.6.x`
>
> This extension is DEPRECATED and is only meant to ease the transition of pre-existing codebases. For new projects use starter-kit `TypeScript` option
>
> This extension will self-remove after installing what you need
>
> **This extension is one-shot and does not provide uninstallation script, make sure you've some form of version control in place to perform rollbacks**

Add TypeScript to your Quasar project (won't work for 0.x Quasar versions).

For simpler cases, just running this extension will do the job.

For the majority of cases, some tweaks on your side will be needed to fix type or linting issues.

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

If you experience problems you cannot understand and resolve, copy your `src` folder (and any project specific configuration) into a freshly created project with `TypeScript` option enabled.
Then proceed to manually update your files to use TypeScript.

To create a new project, run `quasar create <your project name>` using the global Quasar CLI and enable the `TypeScript` option.
