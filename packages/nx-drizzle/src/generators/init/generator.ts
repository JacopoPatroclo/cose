import {
  formatFiles,
  generateFiles,
  Tree,
  updateProjectConfiguration,
  installPackagesTask,
  addDependenciesToPackageJson,
  readProjectConfiguration,
} from '@nx/devkit';
import * as path from 'path';
import { InitGeneratorSchema } from './schema';
import * as thisPackageJson from '../../../package.json';
import {
  betterSqlite3Version,
  drizzleKitVersion,
  drizzleVersion,
  mysql2Version,
  pgVersion,
  postgresJsVersion,
} from './versions';

export function resolveDialectPackage(dialect: string) {
  switch (dialect) {
    case 'pg':
      return {
        postgres: postgresJsVersion,
        // This is needed because the drizzle-kit studio command won't work
        // unless the pg package is also installed but we raccomend to use
        // postgres-js for your application because it's faster
        pg: pgVersion,
      };
    case 'mysql':
      return {
        mysql2: mysql2Version,
      };
    case 'sqlite':
      return {
        'better-sqlite3': betterSqlite3Version,
      };
  }
}

export async function initGenerator(tree: Tree, options: InitGeneratorSchema) {
  const project = readProjectConfiguration(tree, options.projectName);

  if (!project) {
    throw new Error(`Project ${options.projectName} not found`);
  }

  const drizzleDriver = options.driver || 'pg';

  const projectRootOrSourceRoot = project.sourceRoot || project.root;
  const migrationsPath = `${projectRootOrSourceRoot}/migrations`;
  const migrationPositionRelativeToRoot = path.relative(
    project.root,
    migrationsPath,
  );
  const drizzleConfigRelativeToRoot = `./${path.relative(
    project.root,
    `${projectRootOrSourceRoot}/drizzle.config.ts`,
  )}`;

  updateProjectConfiguration(tree, options.projectName, {
    ...project,
    targets: {
      ...(project.targets || {}),
      build: {
        ...(project.targets?.build || {}),
        options: {
          ...(project.targets?.build?.options || {}),
          assets: [
            ...(project.targets?.build?.options?.assets || []),
            {
              input: migrationsPath,
              glob: '**/*',
              output: '/migrations',
            },
          ],
        },
      },
      [`generate:${drizzleDriver}`]: {
        executor: `${thisPackageJson.name}:drizzle-kit`,
        options: {
          command: `generate:${drizzleDriver}`,
          drizzleConfig: drizzleConfigRelativeToRoot,
        },
      },
      drop: {
        executor: `${thisPackageJson.name}:drizzle-kit`,
        options: {
          command: `drop`,
          drizzleConfig: drizzleConfigRelativeToRoot,
        },
      },
      studio: {
        executor: `${thisPackageJson.name}:drizzle-kit`,
        options: {
          command: `studio`,
          drizzleConfig: drizzleConfigRelativeToRoot,
        },
      },
      push: {
        executor: `${thisPackageJson.name}:drizzle-kit`,
        options: {
          command: `push:${drizzleDriver}`,
          drizzleConfig: drizzleConfigRelativeToRoot,
        },
      },
      up: {
        executor: `${thisPackageJson.name}:drizzle-kit`,
        options: {
          command: `up:${drizzleDriver}`,
          drizzleConfig: drizzleConfigRelativeToRoot,
        },
      },
      check: {
        executor: `${thisPackageJson.name}:drizzle-kit`,
        options: {
          command: `check:${drizzleDriver}`,
          drizzleConfig: drizzleConfigRelativeToRoot,
        },
      },
    },
  });

  generateFiles(tree, path.join(__dirname, 'files'), projectRootOrSourceRoot, {
    template: '',
    projectName: options.projectName,
    driver: drizzleDriver,
    packageName: thisPackageJson.name,
    migrationPositionRelativeToRoot,
  });

  const dialectPackage = resolveDialectPackage(drizzleDriver);

  addDependenciesToPackageJson(
    tree,
    {
      'drizzle-orm': drizzleVersion,
      ...dialectPackage,
    },
    {
      'drizzle-kit': drizzleKitVersion,
    },
  );

  await formatFiles(tree);

  return () => {
    installPackagesTask(tree);
  };
}

export default initGenerator;
