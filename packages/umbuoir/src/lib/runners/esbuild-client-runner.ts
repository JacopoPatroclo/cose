import * as esbuild from 'esbuild';
import { config } from '../configuration.js';
import { handleEsbuildException } from './utils.js';

const allowedExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg'];

function getEsbuilgConfig(
  dev: boolean,
  serverConfig: ReturnType<typeof config.getClientConfig>,
): esbuild.BuildOptions {
  return {
    entryPoints: [
      serverConfig.mainEntrypoint,
      ...serverConfig.additionalEntrypoints,
    ],
    bundle: true,
    platform: 'browser',
    outdir: 'dist/public',
    sourcemap: dev,
    minify: !dev,
    assetNames: 'assets/[name]-[hash]',
    publicPath: '/',
    tsconfig: serverConfig.tsconfig,
    loader: allowedExtensions.reduce(
      (acc, ext) => {
        acc[ext] = 'file';
        return acc;
      },
      {} as Record<string, esbuild.Loader>,
    ),
  };
}

export async function run(
  dev: boolean,
  serverConfig: ReturnType<typeof config.getClientConfig>,
) {
  const esbuildConfig = getEsbuilgConfig(dev, serverConfig);

  if (dev) {
    const context = await esbuild.context(esbuildConfig);

    await context.rebuild();

    return {
      dispose: () => context.dispose(),
      rebuild: () => context.rebuild().catch(handleEsbuildException),
    };
  }
  const out = await esbuild.build(esbuildConfig);

  if (out.errors.length > 0) {
    console.error(out.errors);
    process.exit(1);
  }

  if (out.warnings.length > 0) {
    console.warn(out.warnings);
  }

  return undefined;
}
