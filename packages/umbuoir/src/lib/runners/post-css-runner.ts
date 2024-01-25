import { join, parse } from 'path';
import { config } from '../configuration.js';
import postcss, { CssSyntaxError } from 'postcss';
import tailwindcss from 'tailwindcss';
import { mkdir, readFile, writeFile } from 'fs/promises';
import postcssScss from 'postcss-scss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';

async function ensureDirExists(path: string) {
  const { dir } = parse(path);
  await mkdir(dir, { recursive: true });
}

function handlePostcssErrors(promise: Promise<unknown>) {
  return promise.catch((error: CssSyntaxError | Error) => {
    if (error instanceof CssSyntaxError) {
      console.error(error.reason);
      console.error(error.file);
      console.error(error.line);
    } else {
      console.error(error);
    }
  });
}

async function postCssRun(
  isDev: boolean,
  rootDir: string,
  clientConfig: ReturnType<typeof config.getClientConfig>,
) {
  const fileNameOutput = parse(clientConfig.mainCssEntrypoint).name;

  const processor = postcss([
    tailwindcss({
      config: join(rootDir, 'tailwind.config.js'),
    }),
    ...(isDev
      ? []
      : [
          autoprefixer(),
          cssnano({
            preset: 'default',
          }),
        ]),
  ]);

  const to = `dist/public/${fileNameOutput}.css`;
  await ensureDirExists(to);
  const cssContent = await readFile(clientConfig.mainCssEntrypoint, 'utf-8');

  const result = await processor.process(cssContent, {
    parser: postcssScss,
    from: clientConfig.mainCssEntrypoint,
    to,
  });

  await writeFile(to, result.css);
}

export function run(
  isDev: boolean,
  rootDir: string,
  clientConfig: ReturnType<typeof config.getClientConfig>,
) {
  return handlePostcssErrors(postCssRun(isDev, rootDir, clientConfig));
}
