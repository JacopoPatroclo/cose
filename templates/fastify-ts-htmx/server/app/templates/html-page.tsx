import { PropsWithChildren } from '@kitajs/html';

export function HtmlPage(
  props: PropsWithChildren<{
    title?: string;
    head?: JSX.Element;
  }>,
) {
  return (
    <>
      {'<!doctype html>'}
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <link rel="shortcut icon" href="/public/favicon.ico" />
          <title>{props.title}</title>
          {props.head}
          <link rel="stylesheet" href="/public/main.css" />
        </head>
        <body>
          {props.children}
          <script src="/public/main.js"></script>
        </body>
      </html>
    </>
  );
}
