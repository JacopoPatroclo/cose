import { BuildResult, BuildOptions } from 'esbuild';

export function handleEsbuildErrorResult(
  context: 'server' | 'client',
  executeFurther: () => void,
) {
  return function handleError<ProvidedOptions extends BuildOptions>(
    result: BuildResult<ProvidedOptions> | undefined,
  ) {
    if (result === undefined) {
      console.error(`See above to see the error emitted by esbuild`);
      return;
    }
    if (result.errors.length > 0) {
      console.error(result.errors);
      return;
    }
    executeFurther();
  };
}

export function handleEsbuildException(error: unknown) {
  console.error(error);
}
