import mongoose from '../db';
import { metaBaseConfig } from '../config';
import { commonMetaModel } from '../collectionModels';

export interface ThingDocument extends mongoose.Document {
  _hardware: string;
  serial: string;
  deviceType: number;
  deviceTypeName: string;
}

export interface ThingModel extends mongoose.Model<ThingDocument> {
  findNodes: (
    conditions: any,
    projection: any,
    options: unknown,
  ) => Promise<ThingDocument[]>;
  findOneNode: (
    conditions: any,
    projection: any,
    options: unknown,
  ) => Promise<ThingDocument | null>;
  findGateways: (
    conditions: any,
    projection: any,
    options: unknown,
  ) => Promise<ThingDocument[]>;
  findOneGateway: (
    conditions: any,
    projection: any,
    options: unknown,
  ) => Promise<ThingDocument | null>;
  findOneBySerial: (serial: string) => Promise<ThingDocument | null>;
}

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
      // eslint-disable-next-line camelcase
      lora_addr: String,
      // eslint-disable-next-line camelcase
      sensor_present: String,
      deepsleep: String,
      // eslint-disable-next-line camelcase
      ms_consts: mongoose.Schema.Types.Mixed,
      uname: {
        sysname: String,
        lorawan: String,
        egversion: String,
        release: String,
        machine: String,
        nodename: String,
        version: String,
      },
      // eslint-disable-next-line camelcase
      dev_type: String,
    },
    updated: {
      date: String,
      machine: String,
      user: String,
      invocation: String,
    },
  },
  metaBaseConfig,
);

thingSchema.statics.findNodes = function (
  conditions: any,
  projection: any,
  options: unknown,
) {
  if (conditions == null) {
    conditions = {};
  }
  conditions.deviceType = { $ne: 2 };
  return this.find(conditions, projection, options).exec();
};

thingSchema.statics.findOneNode = function (
  conditions: any,
  projection: any,
  options: unknown,
) {
  if (conditions == null) {
    conditions = {};
  }
  conditions.deviceType = { $ne: 2 };
  return this.findOne(conditions, projection, options).exec();
};

thingSchema.statics.findGateways = function (
  conditions: any,
  projection: any,
  options: unknown,
) {
  if (conditions == null) {
    conditions = {};
  }
  conditions.deviceType = 2;
  return this.find(conditions, projection, options).exec();
};

thingSchema.statics.findOneGateway = function (
  conditions: any,
  projection: any,
  options: unknown,
) {
  if (conditions == null) {
    conditions = {};
  }
  conditions.deviceType = 2;
  return this.findOne(conditions, projection, options).exec();
};

thingSchema.statics.findOneBySerial = function (
  this: ThingModel,
  serial: string,
) {
  return this.findOne({ serial }).exec();
};

export const Thing = commonMetaModel.discriminator<ThingDocument, ThingModel>(
  'thing',
  thingSchema,
);
