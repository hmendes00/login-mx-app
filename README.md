# Login MX App

Login with Matrix / Synapse using this Vue Custom Element (Vue WebCompoment) built using [toguro-cli](https://github.com/hmendes00/toguro-cli)

## Requirements

- Node 16 (we have .nvmrc if you just want to run nvm use)

## How to install

Install the dependencies:

```bash
npm install
```

You will need an app-id to start testing your app in the client application.

For now you can use the `@toguro/cli` _(Instructions on how to install here: https://www.npmjs.com/package/@toguro/cli)_

After installation, just the following:

```bash
toguro --generate-app-id
```

After adding the new generated app-id to your .env, you should make sure you have the same inside `fake-api.json` in the client-app (toguro-fe);

## How to run

Run the following command

```bash
npm run dev
```

## How to test

The project will be served in: `http://localhost:3000/`

This is essentially a login/register web-component. We assume that if you want to use matrix to login, it means you want to use matrix in some part of your main application.

For this reason, `matrix-js-sdk` is added as `external` by default in this vite app.

If you want to test it using our base client [toguro-fe](https://github.com/hmendes00/toguro-fe), you can check the `with-matrix` branch.

If you want to integrate it in your existing project you will need to add `matrix-js-sdk` to your window using the same alias we have in the `vite.config.ts` here. By default it should be `window.mxJsSdk = require('matrix-js-dk')`

If you want to add it to your own `vite` project, you might need to configure the node-globals there.
Bellow you will see some of the configs I had to setup to have it running properly

```
// vite.config.(js/ts)

import inject from '@rollup/plugin-inject';
import builtins from 'rollup-plugin-polyfill-node';
import NodeModulesPolyfills from '@esbuild-plugins/node-modules-polyfill';

define: {
  global: 'globalThis'
},
plugins: {
  ...YOURPLUGINS,
  insertBuiltinsPlugin,
  NodeModulesPolyfills
},
build: {
  rollupOptions: {
    output: {
      sourcemap: mode !== 'production',
      rollupOptions: {
        plugins: [inject({ Buffer: ['buffer', 'Buffer'] })]
      }
    }
  }
}

// declare this function to be used in the plugins

function insertBuiltinsPlugin() {
  return {
    name: 'my-project:insert-builtins-plugin',
    options(options) {
      const plugins = options.plugins;
      const idx = plugins.findIndex((plugin) => plugin.name === 'node-resolve');
      // @ts-ignore
      plugins.splice(idx, 0, { ...builtins({ crypto: true, buffer: true }), name: 'rollup-plugin-node-builtins' });
      return options;
    }
  };
}

```

## Deploying App to AWS

I added the script to automatically deploy the app using [AWS CDK](https://docs.aws.amazon.com/cdk/v2/guide/home.html)

You will find the instructions on how to setup and deploy it inside of `/stack/README.md`.

If you already have AWS CLI configured and are already using AWS CDK in your aws account, you could pretty much just run
`cdk deploy --profile=the-profile-you-have` inside `/stack` folder (Don't forget to run `npm install` inside of `STACK` folder before).

At this moment you will need to run `npm run build` manually in the root folder before publishing it.

_NOTE: I don't have strong skills with devops stuff, so if you find things that could be improved in the stack, please open an issue or send me an email <3_

I will be improving the stack to configure automated pipeline in the future (user will be able to choose from CLI what they want to include).

---

Any questions, comments and suggestions you can send an email to
`hmendes00@gmail.com`
