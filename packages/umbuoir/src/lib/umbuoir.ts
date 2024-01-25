import { join, parse } from 'path';
import Watcher from 'watcher';
import ora from 'ora';
import chalk from 'chalk';
import { rm } from 'fs/promises';

import { config } from './configuration.js';
import { handleEsbuildErrorResult } from './runners/utils.js';

import { run as runClient } from './runners/esbuild-client-runner.js';
import { run as runServer } from './runners/esbuild-server-runner.js';
import { run as runPostcss } from './runners/post-css-runner.js';
import { run as runDevServer } from './runners/node-js-runner.js';
import { run as runCopyFile } from './runners/copy-file-runner.js';
import { run as vitestRunner } from './runners/vitest-runner.js';

export async function test(watch: boolean) {
  const testConfig = config.getTestConfig();
  const clientConfig = config.getClientConfig();
  const serverConfig = config.getServerConfig();
  await vitestRunner(watch, testConfig, clientConfig, serverConfig);
}

export async function bundle(isDev: boolean) {
  if (!isDev) {
    await prodBundle();
    return;
  } else {
    await devBundle();
    return;
  }
}

async function silentRemoveDist() {
  try {
    await rm(join(config.getRootDir(), 'dist'), { recursive: true });
  } catch {
    // ignore
  }
}

async function devBundle() {
  const clientConfig = config.getClientConfig();
  const serverConfig = config.getServerConfig();
  const rootDir = config.getRootDir();

  const deductClientDir = parse(join(rootDir, clientConfig.mainEntrypoint)).dir;
  const deductServerDir = parse(join(rootDir, serverConfig.entrypoint)).dir;

  const loadingSpinner = ora(chalk.blue('Building client and server')).start();

  // clean dist folder if needed
  await silentRemoveDist();

  const ignoreInitial = true;
  const debounce = 500;

  const serverWatcher = new Watcher(
    [deductServerDir, join(rootDir, '.env.local'), join(rootDir, '.env')],
    {
      debounce,
      ignoreInitial,
      depth: 50,
      recursive: true,
    },
  );

  const tailwindConfig = join(rootDir, 'tailwind.config.js');
  const clientWatcher = new Watcher([deductClientDir, tailwindConfig], {
    debounce,
    ignoreInitial,
    depth: 50,
    recursive: true,
  });

  const copyDirWatcher = new Watcher(
    serverConfig.syncFileDirs.map((dir) => join(rootDir, dir)),
    {
      debounce,
      ignoreInitial,
      depth: 50,
      recursive: true,
    },
  );

  serverWatcher.on('error', (error) => {
    loadingSpinner.fail(error);
  });
  clientWatcher.on('error', (error) => {
    loadingSpinner.fail(error);
  });
  copyDirWatcher.on('error', (error) => {
    loadingSpinner.fail(error);
  });

  const [client, server] = await Promise.all([
    runClient(true, clientConfig),
    runServer(true, serverConfig),
    runPostcss(true, rootDir, clientConfig),
    runCopyFile(rootDir, serverConfig),
  ]);

  loadingSpinner.succeed(chalk.green('Built successfully'));

  const { devServer, reRunEventEmitter } = runDevServer(
    rootDir,
    server.outfile,
  );

  serverWatcher.on('all', () => {
    loadingSpinner.start(chalk.blue('Rebuilding...'));
    server.context.rebuild().then(
      handleEsbuildErrorResult('server', () => {
        console.clear();
        loadingSpinner.succeed(
          chalk.green('Server has been rebuilt, starting...'),
        );
        reRunEventEmitter.emit('re-run');
      }),
    );
    runPostcss(true, rootDir, clientConfig).then(() => {
      loadingSpinner.succeed(chalk.green('Client css has been rebuilt'));
    });
  });

  clientWatcher.on('all', () => {
    loadingSpinner.start(chalk.blue('Rebuilding...'));
    client
      .rebuild()
      .then(
        handleEsbuildErrorResult('client', () =>
          loadingSpinner.succeed(chalk.green('Client has been rebuilt')),
        ),
      );
    runPostcss(true, rootDir, clientConfig).then(() => {
      loadingSpinner.succeed(chalk.green('Client css has been rebuilt'));
    });
  });

  copyDirWatcher.on('all', () => {
    runCopyFile(rootDir, serverConfig);
  });

  const exitHandler = (error?: Error | number) => {
    // Dispose af all the watchers and the esbuild context and stop the dev server
    clientWatcher.close();
    serverWatcher.close();
    client.dispose();
    server.context?.dispose();
    devServer.kill('SIGINT');

    if (typeof error !== 'number') {
      console.error(error);
      process.exit(1);
    }

    process.exit(error);
  };

  process.on('uncaughtException', exitHandler);
  process.on('unhandledRejection', exitHandler);
  process.on('exit', exitHandler);
}

async function prodBundle() {
  const clientConfig = config.getClientConfig();
  const serverConfig = config.getServerConfig();
  const rootDir = config.getRootDir();

  const loadingSpinner = ora(chalk.blue('Building client and server')).start();

  // clean dist folder if needed
  await silentRemoveDist();

  await Promise.all([
    runClient(false, clientConfig),
    runServer(false, serverConfig),
    runPostcss(false, rootDir, clientConfig),
    runCopyFile(rootDir, serverConfig),
  ]).catch((error) => {
    loadingSpinner.fail(error);
    console.error(error);
    process.exit(1);
  });

  loadingSpinner.succeed(chalk.green('Successfully built client and server'));
}
