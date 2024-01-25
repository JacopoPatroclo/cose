import { spawn } from 'child_process';
import { EventEmitter } from 'events';

let globalDevServer: ReturnType<typeof spawn>;

function spawnNode(cwd: string, fileToRun: string) {
  globalDevServer = spawn('node', ['--enable-source-maps', fileToRun], {
    cwd,
    stdio: 'inherit',
    env: {
      NODE_ENV: 'production',
      ...process.env,
    },
  });

  return globalDevServer;
}

export function run(cwd: string, fileToRun: string) {
  const reRunEventEmitter = new EventEmitter();
  globalDevServer = spawnNode(cwd, fileToRun);

  reRunEventEmitter.on('re-run', () => {
    globalDevServer.kill('SIGINT');
    globalDevServer = spawnNode(cwd, fileToRun);
  });

  return {
    devServer: globalDevServer,
    reRunEventEmitter,
  };
}
