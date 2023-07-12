import dotenv from 'dotenv-defaults';

const result = dotenv.config();

if (result.error) {
  throw result.error;
}

// matching existing/legacy shape
export default {
  database: {
    connectionString: process.env.COSMOS_DB_CONNECTION_STRING,
    baseConfig: {
      discriminatorKey: '_type',
      collection: process.env.COSMOS_DB_COLLECTION,
    },
    name: process.env.COSMOS_DB_NAME,
  },
  user: {
    roles: ['member', 'leader', 'admin', 'su'],
    statuses: ['inactive', 'invited', 'active', 'deactivated'],
  },
};
