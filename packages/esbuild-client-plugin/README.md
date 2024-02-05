# esbuild-client-plugin

This plugin for esbuild to used to bundle your client-side code with [esbuild](https://esbuild.github.io/).
And handle CSS import with postcss.

## How?

First, install the plugin:

```bash

pnpm install -D @jpmart/esbuild-client-plugin

```

Then, add it to your esbuild config:

```js
const esbuildPlugin = require('@jpmart/esbuild-client-plugin');

esbuild.build({
  // ...
  plugins: [
    esbuildPlugin({
      // ...
    }),
  ],
});
```

Finally, import your client-side code into your server-side code:

```ts
import client from './+client.ts';
import style from './style.css';

// This mode will only work if you have bundle: true in your esbuild config
function renderHtml() {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>My App</title>
        <script>${client}</script>
        <style>${style}</style>
      </head>
      <body>
        <p>My App</p>
      </body>
    </html>
  `;
}

// OR see below for the configuration

function renderHtml() {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>My App</title>
        <script src="${client}" />
        <link rel="stylesheet" href="${style}" />
      </head>
      <body>
        <p>My App</p>
      </body>
    </html>
  `;
}
```

this plugin will bundle the client-side code into a string putting it into the default export of the `+client.ts` file. This plugin uses the + in front of the filename to know that it should treat the file as an entry point. This plugin supports a different mode where the bundle code is placed inside a directory. In that case, what the module will export is a string but with the path relative to the directory configured as a public path.

## Options

The interface of the options of this plugins is the following:

```ts
interface EsbuildClientPluginOptions {
  // The esbuild config to pass to the bundler for the client code
  esbuildOptions?: Partial<esbuild.BuildOptions>;
  // Adding this will make the plugin to output the client code to a file
  // this is useful if you want to use the client code served by a CDN or other means
  outputConfig?: {
    // Directory relative to the directory where esbuild is executed
    outDir: string;
    // The directory to use as a prefix for the public path
    publicPath: string;
  };
  // Plugins to use with postcss such as autoprefixer or tailwindcss
  postcssPlugins?: postcss.AcceptedPlugin[];
}
```

example:

```js
const esbuildPlugin = require('@jpmart/esbuild-client-plugin');

esbuild.build({
  // ...
  plugins: [
    esbuildPlugin({
      outputConfig: {
        // Will place the bundle in the dist/public directory
        outDir: 'dist/public',
        // the path of the files will be /public/<filename>.js
        publicPath: '/public',
      },
    }),
  ],
});
```

## Caveats

At this time the imported client-side code must be a valid Typescript module. This means that you have to add `export default '';` a the end file to make Typescript happy. Unfortunately, Typescript does not support the override declaration of Typescript modules (or at least I haven't found it yet).

This plugin only works with css imports when you execute esbuild with the `bundle: true` option.

## Why?

If you are using [esbuild](https://esbuild.github.io/) to bundle your server-side node application, you may want to use it to bundle your client-side code as well. This plugin allows you to do that seamlessly by importing your client-side code into your server-side code.
