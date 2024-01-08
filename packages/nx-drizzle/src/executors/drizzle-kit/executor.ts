import { spawn } from 'child_process';
import { DrizzleKitExecutorSchema } from './schema';
import type { ExecutorContext } from '@nx/devkit';
import { join } from 'path';

async function awaitForProcess(
  process: ReturnType<typeof spawn>,
): Promise<{ success: boolean }> {
  return new Promise((resolve, reject) => {
    process.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true });
      } else {
        reject('Exited with error code: ' + code);
      }
    });
  });
}

function serializeAdditionalArgumentsFromObject(
  additionalArguments: unknown,
  exclude: Array<keyof DrizzleKitExecutorSchema> = [],
) {
  return Object.entries(additionalArguments)
    ?.filter(
      ([key]) => !exclude.includes(key as keyof DrizzleKitExecutorSchema),
    )
    ?.reduce((acc, [key, value]) => {
      return typeof value === 'boolean'
        ? `${acc} --${key}`
        : `${acc} --${key}=${value}`;
    }, '');
}

export default async function runExecutor(
  options: DrizzleKitExecutorSchema,
  context: ExecutorContext,
) {
  const projectConfig =
    context.projectsConfigurations.projects[context.projectName];
  const projectRoot = projectConfig.root;

  // We run drizzle-kit inside the project folder
  const cwd = join(context.root, projectRoot);

  // TODO: Do some research and see if there is a better way to do this
  // maybe npx or something else
  const drizzleKitPath = join(
    context.root,
    // This is the path to the drizzle-kit package in the node_modules of the root
    // but the cwd is inside the project folder, so we need to go up a number of times
    // required by the projectRoot path to get to the root node_modules
    '../'.repeat(projectRoot.split('/').length - 2),
    'node_modules/drizzle-kit/bin.cjs',
  );

  // We default to the drizzle.config.ts file inside the project src folder
  const configDrizzlePath = options.drizzleConfig || `./src/drizzle.config.ts`;

  // Pass additional arguments to the drizzle-kit command
  const additionalInlineArguments = serializeAdditionalArgumentsFromObject(
    options,
    ['command', 'drizzleConfig'],
  );

  const command = `${drizzleKitPath} ${options.command} --config=${configDrizzlePath} ${additionalInlineArguments}`;

  const cmd = spawn(
    // This is the command that will be run
    // we alaways targer the config inside the project folder
    command,
    {
      cwd,
      shell: true,
      // We need to pass the environment variables to the child process
      // this way we use nx provisioning of environment variables
      // also in the drizzle-kit configuration file
      env: process.env,
      stdio: [process.stdin, 'pipe', process.stderr],
    },
  );

  let oldLineToRemove = 0;
  cmd.stdout.on('data', (data) => {
    // This is here to solve the problem with the output of the drizzle-kit command.
    // This is because the output is not being cleared, but rather overwritten.
    // So we need to remove the old output before writing the new one.
    const removeLastLine = '\x1b[1A\x1b[2K';
    for (let index = 0; index < oldLineToRemove; index++) {
      process.stdout.write(removeLastLine);
    }
    process.stdout.write(data);
    // This is here so the last line of the output is visible,
    // otherwise in some cases it gets hidden by the prompt.
    process.stdout.write('\n\n');

    // We need to know how many lines to remove in the next iteration
    // so we can clear the output.
    oldLineToRemove = data.toString().split('\n').length;
  });

  return awaitForProcess(cmd);
}
