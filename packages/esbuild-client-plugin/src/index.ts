import * as esbuild from 'esbuild';
import { readFile, rm, writeFile } from 'fs/promises';
import { join, parse } from 'path';
import postcss from 'postcss';
import './modules';

class NotWorkingWithoutBundle extends Error {
  constructor() {
    super(
      'esbuild-client-plugin: This plugin will not work as expected without bundle to false without providing outputConfig',
    );
  }
}

interface EsbuildClientPluginOptions {
  esbuildOptions?: Partial<esbuild.BuildOptions>;
  outputConfig?: {
    outDir: string;
    publicPath: string;
  };
  postcssPlugins?: postcss.AcceptedPlugin[];
}

const tmpDir = join(__dirname, 'tmp');
const CLIENT_NS = 'esbuild-client-plugin-client-ns';
const CSS_NS = 'esbuild-client-plugin-css-ns';

function makePlugn(opts?: EsbuildClientPluginOptions): esbuild.Plugin {
  const postcssBuilder = postcss(opts?.postcssPlugins || []);

  return {
    name: 'esbuild-client-plugin',
    setup(build) {
      if (!build.initialOptions.bundle && !opts?.outputConfig) {
        throw new NotWorkingWithoutBundle();
      }

      build.onResolve({ filter: /.*\.css$/ }, (args) => {
        const filePath = join(args.resolveDir, args.path);

        return {
          path: filePath,
          watchFiles: [filePath],
          namespace: CSS_NS,
        };
      });

      build.onLoad({ filter: /.*/, namespace: CSS_NS }, async (args) => {
        try {
          const cssBaseName = parse(args.path).base;
          const jsModuleFileName = `${cssBaseName}.js`;
          const fullPathWhereBundledFileShouldBe = opts?.outputConfig
            ? join(opts.outputConfig.outDir, cssBaseName)
            : join(tmpDir, jsModuleFileName);

          const cssfileContent = await readFile(args.path, 'utf-8');
          const result = await postcssBuilder.process(cssfileContent, {
            from: args.path,
            to: fullPathWhereBundledFileShouldBe,
            map: opts?.esbuildOptions?.sourcemap ? { inline: true } : false,
          });

          if (opts?.outputConfig) {
            await writeFile(fullPathWhereBundledFileShouldBe, result.css);
            return {
              contents: join(opts?.outputConfig?.publicPath, cssBaseName),
              loader: 'text',
            };
          }

          return {
            contents: result.css,
            loader: 'text',
          };
        } catch (error) {
          return {
            errors: [{ text: String(error) }],
          };
        }
      });

      build.onResolve({ filter: /\+.*$/ }, (args) => {
        const filePath = join(args.resolveDir, args.path);

        return {
          path: filePath,
          watchFiles: [filePath],
          namespace: CLIENT_NS,
        };
      });

      build.onLoad({ filter: /.*/, namespace: CLIENT_NS }, async (args) => {
        try {
          const fileName = parse(args.path).name;
          const fullPathWhereBundledFileShouldBe = opts?.outputConfig
            ? join(opts.outputConfig.outDir, `${fileName}.js`)
            : join(tmpDir, `${fileName}.js`);

          const result = await esbuild.build({
            entryPoints: [args.path],
            outfile: fullPathWhereBundledFileShouldBe,
            bundle: true,
            platform: 'browser',
            ...(opts?.esbuildOptions || {}),
            minify: true,
            sourcemap: false,
            target: ['chrome58', 'firefox57', 'safari11', 'edge16'],
          });

          // We use by default the path provided
          // in case of something like /public we want to use the
          // /public/file.js
          let contents = '';

          if (opts?.outputConfig) {
            contents = join(opts?.outputConfig?.publicPath, `${fileName}.js`);
          } else {
            contents = await readFile(
              fullPathWhereBundledFileShouldBe,
              'utf-8',
            );
          }

          return {
            contents,
            errors: result.errors,
            loader: 'text',
          };
        } catch (error) {
          return {
            errors: [{ text: String(error) }],
          };
        }
      });

      build.onEnd(async () => {
        if (!opts?.outputConfig) {
          await rm(tmpDir, { recursive: true }).catch(() => {});
        }
      });
    },
  };
}

module.exports = makePlugn;
