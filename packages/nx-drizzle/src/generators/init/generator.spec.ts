import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';
import { applicationGenerator } from '@nx/node';

import { initGenerator } from './generator';
import { InitGeneratorSchema } from './schema';

describe('init generator', () => {
  let tree: Tree;
  const options: InitGeneratorSchema = { projectName: 'test' };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should add the expected targests with the correct paths for drizzle config', async () => {
    await applicationGenerator(tree, {
      name: options.projectName,
    });

    await initGenerator(tree, options);

    const config = readProjectConfiguration(tree, options.projectName);

    expect(config.targets['generate:pg'].executor).toBe(
      '@jpmart/nx-drizzle:drizzle-kit',
    );

    expect(config.targets['generate:pg'].options.command).toBe('generate:pg');

    expect(config.sourceRoot).toBe('test/src');
    expect(config.targets['generate:pg'].options.drizzleConfig).toBe(
      './src/drizzle.config.ts',
    );
  });
});
