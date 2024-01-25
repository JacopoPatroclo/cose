#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { configReader } from '../lib/config-reader.js';
import { join } from 'path';
import { lstat } from 'fs/promises';
import { bundle, test } from '../lib/umbuoir.js';

async function ensureConfigHasBeenRead(localPath: string) {
  const configPath = join(process.cwd(), localPath);
  const configExists = await lstat(configPath)
    .then(() => true)
    .catch(() => false);

  if (!configExists) {
    console.error(`Config file ${configPath} does not exist`);
    process.exit(1);
  }

  // We read the config
  // this is a side effect function
  // the config should popolate the config singleton
  // as the user choose
  await configReader(configPath);
}

async function main() {
  await yargs(hideBin(process.argv))
    .option('config', {
      alias: 'c',
      type: 'string',
      description: 'Path to the config file',
      default: './umbuoir.config.ts',
    })
    .command(
      'serve',
      'start the dev server',
      (a) => a,
      async ({ config }) => {
        await ensureConfigHasBeenRead(config);
        return await bundle(true);
      },
    )
    .command(
      'build',
      'build the application for production',
      (a) => a,
      async ({ config }) => {
        await ensureConfigHasBeenRead(config);
        return await bundle(false);
      },
    )
    .command(
      'test',
      'run the test suite',
      (yargss) => {
        return yargss.option('watch', {
          alias: 'w',
          type: 'boolean',
          description: 'Watch mode',
          default: false,
        });
      },
      async ({ config, watch }) => {
        await ensureConfigHasBeenRead(config);
        return await test(watch);
      },
    )
    .help()
    .demandCommand(1)
    .parseAsync();
}

main();
