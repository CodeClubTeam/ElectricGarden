import { AppEnv, AppEnvs } from '@eg/doc-db';
import { getRequiredConfig } from './config';

export const ACTING_STAGING_APP_ENV: AppEnv = 'development';

export const getAppEnvIndex = () => {
  const APP_ENV_RAW = getRequiredConfig('APP_ENV');
  const APP_ENV = AppEnvs.find((e) => e === APP_ENV_RAW);
  if (!APP_ENV) {
    throw new Error(
      `Environment setting APP_ENV not valid. Valid values: ${AppEnvs.join(
        ', ',
      )}`,
    );
  }
  return AppEnvs.indexOf(APP_ENV);
};

export type BooleanFromEnv = (env: AppEnv) => boolean;

export const booleanFromEnvCreate = (
  direction: 'up' | 'down',
): BooleanFromEnv => {
  const appEnvIndex = getAppEnvIndex();
  switch (direction) {
    case 'up':
      return (env) => AppEnvs.indexOf(env) <= appEnvIndex;
    case 'down':
      return (env) => AppEnvs.indexOf(env) >= appEnvIndex;
    default:
      throw new Error(`direction not recognised: ${direction}`);
  }
};
