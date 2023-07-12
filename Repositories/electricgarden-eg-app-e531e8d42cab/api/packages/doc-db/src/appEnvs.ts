export const AppEnvs = [
  'production',
  'staging', // doesn't exist but this is where it slots in
  'test',
  'development',
  'localdev',
] as const;

export type AppEnv = typeof AppEnvs[number];
