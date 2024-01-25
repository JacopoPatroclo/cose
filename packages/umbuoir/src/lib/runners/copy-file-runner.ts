import { join } from 'path';
import { config } from '../configuration.js';
import { cp, lstat } from 'fs/promises';
import { CopyOptions } from 'fs';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cpWithRetry(
  src: string,
  dest: string,
  opts?: CopyOptions,
  retries = 0,
) {
  return cp(src, dest, opts).catch((err) => {
    if (retries > 3) throw err;
    return sleep(200).then(() => cpWithRetry(src, dest, opts, retries + 1));
  });
}

export async function run(
  rootDir: string,
  serverConfig: ReturnType<typeof config.getServerConfig>,
) {
  const dirsToCopy = serverConfig.syncFileDirs;

  if (dirsToCopy.length === 0) return;

  const jobs = dirsToCopy.map(async (dir) => {
    const src = join(rootDir, dir);
    const dest = join(rootDir, 'dist', dir);
    const fileExists = await lstat(src)
      .then(() => true)
      .catch(() => false);
    if (!fileExists) {
      console.log(
        `[umbuoir] file or directory ${src} does not exist, skipping...`,
      );
      return;
    }
    return cpWithRetry(src, dest, { recursive: true });
  });

  await Promise.all(jobs);
}
