# @jpmart/fastify-jsx

This is a rendering engine for Fastify that supports JSX. The JSX runtime used is the super good [@kitajs/html](https://github.com/kitajsl). See their documentation for more information.

This plugin supports Fastify >= 4.x

This plugin uses

## Installing

To use the `@jpmart/fastify-jsx` package, follow these steps:

1. Install the required npm packages, `@jpmart/fastify-jsx` and `@kitajs/ts-html-plugin`, to
   enable editor intellisense. Open your terminal and run:

   ```sh
   npm install @jpmart/fastify-jsx @kitajs/ts-html-plugin
   ```

2. Configure your TypeScript project to transpile TSX/JSX into JavaScript and using our
   [LSP Plugin](#editor-intellisense-and-cli-tool). Update your `tsconfig.json` file with
   the following settings:

   ```jsonc
   // tsconfig.json

   {
     "compilerOptions": {
       "jsx": "react",
       "jsxFactory": "Html.createElement",
       "jsxFragmentFactory": "Html.Fragment",
       "plugins": [{ "name": "@kitajs/ts-html-plugin" }]
     }
   }
   ```

3. Append the
   [`xss-scan`](https://github.com/kitajs/ts-html-plugin/tree/main#running-as-cli) command
   into your test script. This CLI comes from @kitajs/ts-html-plugin, which catches XSS vulnerabilities that may be introduced into your codebase, automating the XSS scanning process to run every time you test your code, like inside your CI/CD environment. Open your `package.json` file and add the following script:

   ```jsonc
   // package.json

   {
     "scripts": {
       "test": "xss-scan"
     }
   }
   ```

4. Ensure that your code editor is using the TypeScript version from your project's
   `node_modules` instead of the globally installed TypeScript. For Visual Studio Code,
   you can configure this in your workspace settings:

   ```jsonc
   // .vscode/settings.json

   {
     "typescript.tsdk": "node_modules/typescript/lib"
   }
   ```

5. Register the plugin in your Fastify application

   ```tsx
   // app.tsx

   import fastify from 'fastify';
   import fastifyJsx from '@jpmart/fastify-jsx';

   const app = fastify();

   app.register(fastifyJsx);

   app.get('/', (req, res) => {
     return res.render(() => <YourHomepageComponent />);
   });

   app.listen(3000);
   ```

> [!CAUTION]
>
> # Be sure your setup is working correclty!
>
> Try writing `console.log(<div>{String.name}</div>);` in your editor. If it **THROWS**
> a `XSS` error, then your setup is correct. Refer to the
> [@kitajs/ts-html-plugin](https://github.com/kitajs/ts-html-plugin) repository for more
> details on setting up editor intellisense. _(It should throw, as `String.name` has a type of `string`, type which may or may not have special caracters)_

## Context

As in React, the context is a way to access some data from a parent component in a child component without having to pass it as a prop. This library provides a context implementation using two primitives: `defineContext` and `consumeContext`. The names are different from React's `createContext` and `useContext` to avoid confusion with the React implementation.
Here is an example of how to use the context:

```tsx
const MyContext = defineContext<{ name: string }>();

const MyComponent = () => {
  const { name } = consumeContext(MyContext);
  return <div>Hello {name}</div>;
};

// ...

app.get('/', (req, res) => {
  return res.render(() => (
    <MyContext.Provider value={{ name: 'John' }}>
      <MyComponent />
    </MyContext.Provider>
  ));
});
```

This library exposes two primitives based on the context implementation that are generally useful:

- `consumeFastify`: This is a context that provides the Fastify instance. It is useful to access the Fastify instance in a component without having to pass it as a prop.
- `consumeRequest`: This is a context that provides the Fastify request instance. It is useful to access the request instance in a component without having to pass it as a prop.

They can be used like this:

```tsx
const MyComponent = async () => {
  const fastify = consumeFastify();
  const request = consumeRequest();

  const table = request.headers['x-table-name'];

  const data = await fastify.db.query(`SELECT * FROM ${table}`);

  return (
    <div>
      <p>Data from table {table}</p>
      <pre>{JSON.stringify(data)}</pre>
    </div>
  );
};
```

NOTE: If you are using a type inference strategy for your Fastify request, you will need to cast the request properties to the expected type. This is by design because the hook consumeRequest had no way of knowing for which request it had been called. This makes it possible to use the same component for different requests.

## Suspense

This library wraps the Suspense component provided by `@kitajs/html`. This is done to have a better user experience when using Suspense. The `Suspense` component provided by `@kitajs/html` requires passing a render ID given by the internal render to support HTML streaming. Thanks to the context implementation this property is provided implicitly. This means that you can use Suspense like this:

```tsx
import { Suspense } from '@jpmart/fastify-jsx';

async function MyAsyncComponent() {
  const data = await asyncFetchData();
  return <div>{data}</div>;
}

const MyComponent = () => {
  return (
    <div>
      <p>Page title</p>
      <Suspense fallback={<div>Loading...</div>}>
        <MyAsyncComponent />
      </Suspense>
    </div>
  );
};
```

## Usage with HTMX or Other similar libraries

This library has been developed to make developing a fastify application with those libraries easier. To have a better developer experience we recommend importing the relative type definitions in your entry point like so:

For HTMX:

```tsx
// app.tsx
import '@jpmart/fastify-jsx/htmx';
```

For Hotwire-Turbo:

```tsx
// app.tsx
import '@jpmart/fastify-jsx/hotwire-turbo';
```

This will include all the type definitions for the library you are using.
