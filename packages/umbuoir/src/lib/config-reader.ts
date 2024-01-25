export async function configReader(configPath: string) {
  await import(configPath);
  return;
}
