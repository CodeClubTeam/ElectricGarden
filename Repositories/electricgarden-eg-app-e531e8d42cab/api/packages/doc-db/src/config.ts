import { DISCRIMINATOR_KEY } from './constants';

const getRequiredConfig = (key: string): string => {
  if (!(key in process.env)) {
    throw new Error(`Environment variable not found ${key}`);
  }
  return process.env[key] ?? '';
};

export const getConnectionString = () => {
  if (process.env.NODE_ENV === 'test') {
    console.log('Using test MONGO_URL for db connection string.');
    return getRequiredConfig('MONGO_URL');
  }
  return getRequiredConfig('COSMOS_DB_CONNECTION_STRING');
};

export const databaseName = 'db';

export const userConfig = {
  roles: ['kiosk', 'member', 'leader', 'admin', 'su'] as const,
  statuses: ['inactive', 'invited', 'active', 'deactivated'] as const,
};

export const orgModes = ['standard', 'kiosk'] as const;

export const sampleMetrics = [
  'probeSoilTemp',
  'probeAirTemp',
  'probeMoisture',
  'ambientTemp',
  'ambientHumidity',
  'co2',
  'light',
] as const;

export type SampleMetric = typeof sampleMetrics[number];

export const orgBaseConfig = {
  discriminatorKey: DISCRIMINATOR_KEY,
  collection: 'organizations',
};

// treating this as an alias for outside tenants non-transaction data collection
export const metaBaseConfig = {
  discriminatorKey: DISCRIMINATOR_KEY,
  collection: 'manufacture',
};

export const transactionBaseConfig = {
  discriminatorKey: DISCRIMINATOR_KEY,
  collection: 'points',
};
