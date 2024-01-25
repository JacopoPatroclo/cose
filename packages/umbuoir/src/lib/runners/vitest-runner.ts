import { startVitest } from 'vitest/node';
import tsconfigPaths from 'vite-tsconfig-paths';
import { config } from '../configuration.js';

export async function run(
  watch: boolean,
  testConfig: ReturnType<typeof config.getTestConfig>,
  clientConfing: ReturnType<typeof config.getClientConfig>,
  serverConfig: ReturnType<typeof config.getServerConfig>,
) {
  const vitest = await startVitest(
    'test',
    [],
    {
      coverage: {
        provider: 'istanbul',
        enabled: !watch,
        exclude: [
          clientConfing.mainEntrypoint,
          ...clientConfing.additionalEntrypoints,
          '*.config.*',
          '.test-utils/**',
          serverConfig.entrypoint,
          'server/env.ts',
          'server/app/drizzle/**',
        ],
      },
      watch,
    },
    {
      plugins: [
        tsconfigPaths({
          configNames: testConfig.tsConfigPaths,
        }),
      ],
    },
  );

  if (!vitest?.shouldKeepServer()) {
    await vitest?.close();
  }
}
