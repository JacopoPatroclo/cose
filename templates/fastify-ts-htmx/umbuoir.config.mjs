import { config } from '@jpmart/umbuoir';

// Configure umbuoir bundler
config
  // Set the server entrypoint, it marks where the server code starts
  .setServerEntrypoint('server/app.ts')
  // Set the main client entrypint, this javascript will alaways be loaded
  // on every page
  .setMainClientEntrypoint('client/main.ts')
  // Set the main css entrypoint, is where tailwind directive are used
  .setMainCssEntrypoint('client/main.scss')
  // Set the additional directories that will be synced to the dist folder
  .setSyncFileOrDir('public')
  // Copy also the package.json file so we can deploy only the dist folder
  .setSyncFileOrDir('package.json')
  // Copy also the migrations folder so we can use it on the server for the migratiions
  .setSyncFileOrDir('migrations');
