import { readCachedProjectGraph } from '@nx/devkit';
import { join } from 'path';

/**
 * Given a project name it will return the globs for the schema files for drizzle
 * It will also include the globs for the schema files of the dependencies
 * both npm and local, so you can import them in your project
 * the dependency to be imported correctly must have a schema.ts file in the project
 * that exports the schema definition for drizzle
 * @param projectName the name of the project in your monorepo
 * @returns Array<string>
 */
export function retriveGlobsForDrizzleSchemaForProject(projectName: string) {
  const projectGraph = readCachedProjectGraph();
  const project = projectGraph.nodes[projectName];
  const projectRoot = project.data.root;
  const projectDependencies = projectGraph.dependencies[projectName];
  const projectDependenciesRoots = projectDependencies
    .map((dependency) => {
      // We expect that a library has a schema.ts that rapresent the schema for drizzle
      const schemaGlob = '/**/**/schema.ts';
      const tablesGlob = '/**/**/tables.ts';
      const target = dependency.target;
      if (target.startsWith('npm:')) {
        // Handle npm dependencies
        const calculateBackToRoot = projectRoot.split('/').length;
        const backToRoot = '../'.repeat(calculateBackToRoot);
        const nodeModulesPath = join(
          backToRoot,
          'node_modules',
          target.replace('npm:', ''),
        );
        return [
          join(nodeModulesPath, schemaGlob),
          join(nodeModulesPath, tablesGlob),
        ];
      } else {
        // Handle local dependencies
        const calculateBackToRoot = projectRoot.split('/').length;
        const backToRoot = '../'.repeat(calculateBackToRoot);
        const dependencyProject = projectGraph.nodes[target];
        const projectPath = join(
          backToRoot,
          dependencyProject.data.sourceRoot || dependencyProject.data.root,
        );
        return [join(projectPath, schemaGlob), join(projectPath, tablesGlob)];
      }
    })
    .reduce((acc, val) => acc.concat(val), [])
    .filter(Boolean);

  const schemaPaths = ['./src/**/**/schema.ts', ...projectDependenciesRoots];

  if (process.env.DEBUG) {
    console.log('Path loaded by drizzle\n', schemaPaths.join('\n'));
  }

  return schemaPaths;
}
