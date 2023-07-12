import { orgBaseConfig, metaBaseConfig, transactionBaseConfig } from './config';
import mongoose from './db';
import { getLastRequestCharge } from './requestCharge';

function reportRequestCharge(this: unknown) {
  if (
    process.env.NODE_ENV !== 'test' &&
    process.env.NODE_ENV !== 'production'
  ) {
    // tests run with mongodb so this won't work for them
    getLastRequestCharge().then((requestCharge) => {
      if (this instanceof mongoose.Query) {
        const query = JSON.stringify(this.getQuery());
        console.info({ requestCharge, query });
      }
    }, console.error);
  }
}

export const commonOrgModel = mongoose.model(
  'Common',
  new mongoose.Schema({}, orgBaseConfig).post('find', reportRequestCharge),
);

export const commonMetaModel = mongoose.model(
  'CommonManufacture',
  new mongoose.Schema({}, metaBaseConfig).post('find', reportRequestCharge),
);

export const commonTransactionModel = mongoose.model(
  'CommonPoints',
  new mongoose.Schema({}, transactionBaseConfig).post(
    'find',
    reportRequestCharge,
  ),
);
