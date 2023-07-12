//const config = require('../config');
const mongoose = require('mongoose');

const baseConfig = {
  discriminatorKey: '_type',
  collection: 'manufacture',
};

const commonModel = mongoose.model(
  'CommonManufacture',
  new mongoose.Schema({}, baseConfig),
);

const thingSchema = new mongoose.Schema(
  {
    _hardware: String,
    deviceType: Number,
    deviceTypeName: String,
    batch: Number,
    mac: String,
    cpuid: String,
    flash: {
      device: String,
      manufacturer: String,
    },
    serial: String,
    batchUnit: String,
    instantiated: {
      date: String,
      machine: String,
      user: String,
      invocation: String,
    },
    properties: {
      lora_addr: String,
      sensor_present: String,
      deepsleep: String,
      ms_consts: [Number],
      uname: {
        sysname: String,
        lorawan: String,
        egversion: String,
        release: String,
        machine: String,
        nodename: String,
        version: String,
      },
      dev_type: String,
    },
    updated: {
      date: String,
      machine: String,
      user: String,
      invocation: String,
    },
  },
  baseConfig,
);

thingSchema.static('findNode', function(conditions, projection, options) {
  if (conditions == null) {
    conditions = {};
  }
  conditions.deviceType = 1;
  return this.find(conditions, projection, options);
});

thingSchema.static('findOneNode', function(conditions, projection, options) {
  if (conditions == null) {
    conditions = {};
  }
  conditions.deviceType = 1;
  return this.findOne(conditions, projection, options);
});

thingSchema.static('findGateway', function(conditions, projection, options) {
  if (conditions == null) {
    conditions = {};
  }
  conditions.deviceType = 2;
  return this.find(conditions, projection, options);
});

thingSchema.static('findOneGateway', function(conditions, projection, options) {
  if (conditions == null) {
    conditions = {};
  }
  conditions.deviceType = 2;
  return this.findOne(conditions, projection, options);
});

module.exports = commonModel.discriminator('thing', thingSchema);
