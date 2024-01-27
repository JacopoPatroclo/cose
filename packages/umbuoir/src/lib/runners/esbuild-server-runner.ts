import * as esbuild from 'esbuild';
import { config } from '../configuration.js';
import { handleEsbuildException } from './utils.js';

function getEsbuilgConfig(
  dev: boolean,
  serverConfig: ReturnType<typeof config.getServerConfig>,
): esbuild.BuildOptions {
  const outfile = 'dist/main.js';
  return {
    entryPoints: [serverConfig.entrypoint],
    bundle: true,
    platform: 'node',
    outfile,
    packages: 'external',
    sourcemap: dev,
    minify: !dev,
    tsconfig: serverConfig.tsconfig,
  };
}

export async function run(
  dev: boolean,
  serverConfig: ReturnType<typeof config.getServerConfig>,
) {
  const esbuildConfig = getEsbuilgConfig(dev, serverConfig);

  if (dev) {
    const context = await esbuild.context(esbuildConfig);

    await context.rebuild();

    return {
      outfile: esbuildConfig.outfile,
      context: {
        dispose: () => context.dispose(),
        rebuild: () => context.rebuild().catch(handleEsbuildException),
      },
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

  return {
    outfile: esbuildConfig.outfile,
  };
}
