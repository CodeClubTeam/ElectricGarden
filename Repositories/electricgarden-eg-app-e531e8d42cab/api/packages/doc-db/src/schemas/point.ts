/* eslint-disable camelcase */
import { commonTransactionModel } from '../collectionModels';
import { transactionBaseConfig } from '../config';
import mongoose from '../db';
import { DocumentQuery } from 'mongoose';

export interface PointDocument extends mongoose.Document {
  nodeSerial: string;
  gatewaySerial: string;
  timestampSeconds: string; // WTF also readings are strings!?!?
  readings: Partial<{
    probe_soil_temp: string;
    probe_air_temp: string;
    battery_voltage: string;
    ambient_temperature: string;
    probe_moisture: string;
    rssi: string;
    light_sensor: string;
    snr: string;
    ambient_humidity: string;
    co2: string;
    error_code: string;
  }>;
  _created: Date; // legacy as it's in _id anyway
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PointModel extends mongoose.Model<PointDocument> {
  queryBySerialAndDateRange: (
    serial: string,
    dateRange: { startDate?: Date; endDate?: Date },
  ) => DocumentQuery<PointDocument[], PointDocument, unknown>;
}

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
      type: String, // WTF also readings are strings!?!?
      required: true,
    },
    readings: {
      type: {
        probe_soil_temp: String,
        probe_air_temp: String,
        battery_voltage: String,
        ambient_temperature: String,
        probe_moisture: String,
        rssi: String,
        light_sensor: String,
        co2: String,
        snr: String,
        ambient_humidity: String,
        error_code: String,
      },
      required: true,
    },
  },
  transactionBaseConfig,
);

const toSeconds = (timestamp: Date) => Math.floor(timestamp.getTime() / 1000);

pointSchema.statics.queryBySerialAndDateRange = function (
  this: PointModel,
  serial: string,
  { startDate, endDate }: { startDate?: Date; endDate?: Date },
) {
  let query = this.find({
    nodeSerial: serial,
  }).maxTimeMS(10000); // also historical
  if (startDate) {
    query = query.where('timestampSeconds').gte(toSeconds(startDate));
  }
  if (endDate) {
    query = query.where('timestampSeconds').lte(toSeconds(endDate));
  }
  return query;
};

export const Point = commonTransactionModel.discriminator<
  PointDocument,
  PointModel
>('point', pointSchema);
