import { Type, Static } from '@sinclair/typebox';

const serverConfigSchema = Type.Object({
  entrypoint: Type.String(),
  syncFileDirs: Type.Array(Type.String()),
});

const clientConfigSchema = Type.Object({
  mainEntrypoint: Type.String(),
  additionalEntrypoints: Type.Array(Type.String()),
  mainCssEntrypoint: Type.String(),
});

const testConfigSchema = Type.Object({
  tsConfigPaths: Type.Array(Type.String()),
});

class ConfigurationHolder {
  private rootDir: string;
  private serverConfig: Partial<Static<typeof serverConfigSchema>> = {};
  private clientConfig: Partial<Static<typeof clientConfigSchema>> = {};
  private testConfig: Partial<Static<typeof testConfigSchema>> = {};

  constructor() {
    this.rootDir = process.cwd();
    this.clientConfig.additionalEntrypoints = [];
    this.serverConfig.syncFileDirs = [];
    this.testConfig.tsConfigPaths = [];
  }

  setProjectRoot(rootdir: string) {
    this.rootDir = rootdir;
    return this;
  }

  setServerEntrypoint(entrypoint: string) {
    this.serverConfig.entrypoint = entrypoint;
    return this;
  }

  setMainClientEntrypoint(entrypoint: string) {
    this.clientConfig.mainEntrypoint = entrypoint;
    return this;
  }

  setMainCssEntrypoint(entrypoint: string) {
    this.clientConfig.mainCssEntrypoint = entrypoint;
    return this;
  }

  setClinetAdditionalEntrypoint(entrypoints: string) {
    this.clientConfig.additionalEntrypoints?.push(entrypoints);
    return this;
  }

  setSyncFileOrDir(dir: string) {
    this.serverConfig.syncFileDirs?.push(dir);
    return this;
  }

  getRootDir() {
    return this.rootDir;
  }

  getServerConfig() {
    // TODO: validate config
    return this.serverConfig as Static<typeof serverConfigSchema>;
  }

  getClientConfig() {
    // TODO: validate config
    return this.clientConfig as Static<typeof clientConfigSchema>;
  }

  getTestConfig() {
    // TODO: validate config
    if (this.testConfig.tsConfigPaths?.length === 0) {
      // Default to tsconfig.spec.json
      this.testConfig.tsConfigPaths?.push('tsconfig.spec.json');
    }
    return this.testConfig as Static<typeof testConfigSchema>;
  }
}

// Export the config instance as a singleton
// this is needed because of the type of api
// we want to expose in the config
export const config = new ConfigurationHolder();
