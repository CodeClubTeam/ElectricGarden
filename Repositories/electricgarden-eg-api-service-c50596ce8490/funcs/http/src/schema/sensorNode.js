import config from '../config';
import commonModel from './common.js';
import mongoose from 'mongoose';

const baseConfig = config.database.baseConfig;

var sensorSchema = new mongoose.Schema(
  {
    _organisation: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    serial: {
      type: String,
      required: true,
    },
    _created: {
      type: Date,
      default: Date.now,
    },
  },
  baseConfig,
);

sensorSchema.static('findByName', async function(name) {
  return this.findOne({ name: name.replace('_', ' ') });
});

sensorSchema.static('findBySerial', async function(serial) {
  return this.findOne({ serial });
});

sensorSchema.static('findBySerialOrName', async function(value) {
  return this.findOne({
    $or: [{ name: value.replace('_', ' ') }, { serial: value }],
  });
});

sensorSchema.static('findByIdOrSerialOrName', async function(value) {
  let arr = [{ name: value }, { serial: value }];
  if (value.length === 24) {
    arr.push({ _id: new mongoose.Schema.Types.ObjectId(value) });
  }
  return this.findOne({ $or: arr });
});

module.exports = commonModel.discriminator('sensor', sensorSchema);
