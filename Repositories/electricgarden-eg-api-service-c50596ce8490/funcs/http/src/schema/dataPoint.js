import config from '../config';
import commonModel from './common.js';
import mongoose from 'mongoose';

const baseConfig = Object.assign({}, config.database.baseConfig, {
  collection: 'points',
});

const commonModel = mongoose.model(
  'CommonPoints',
  new mongoose.Schema({}, baseConfig),
);

const pointSchema = new mongoose.Schema(
  {
    nodeSerial: {
      type: String,
      required: true,
    },
    gatewaySerial: {
      type: String,
      required: true,
    },
    timestampSeconds: {
      type: String,
      required: true,
    },
    readings: {
      type: mongoose.Schema.Types.Mixed,
    },
    _created: {
      type: Date,
      default: Date.now,
    },
    _partitionKey: {
      type: String,
      required: true,
    },
  },
  baseConfig,
);

module.exports = commonModel.discriminator('point', pointSchema);
