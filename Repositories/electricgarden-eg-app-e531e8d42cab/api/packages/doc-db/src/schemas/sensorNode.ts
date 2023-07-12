import { commonOrgModel } from '../collectionModels';
import { orgBaseConfig } from '../config';
import mongoose from '../db';
import { ObjectId } from 'mongodb';
import { Organisation } from './organisation';

export interface SensorDocument extends mongoose.Document {
  _organisation: mongoose.Types.ObjectId;
  name: string;
  serial: string;
  readingStats?: {
    first?: Date;
    last?: Date;
    count: number;
  };
  _created: Date;

  updateStatsForReading: () => void;
  organisationId?: string;
}

export interface SensorModel extends mongoose.Model<SensorDocument> {
  findOneByName: (name: string) => Promise<SensorDocument | null>;
  findOneBySerial: (serial: string) => Promise<SensorDocument | null>;
  findOneBySerialOrName: (value: string) => Promise<SensorDocument | null>;
  findOneByIdOrSerialOrName: (value: string) => Promise<SensorDocument | null>;
  findByOrganisation: (
    organisationId: string | ObjectId,
  ) => Promise<SensorDocument[]>;
}

const sensorSchema = new mongoose.Schema<SensorDocument>(
  {
    _organisation: {
      type: mongoose.Schema.Types.ObjectId,
    },
    name: {
      type: String,
      default: '',
    },
    serial: {
      type: String,
      required: true,
    },
    readingStats: {
      first: Date,
      last: Date,
      count: {
        type: Number,
        required: true,
        default: 0,
      },
    },
    _created: {
      type: Date,
      default: Date.now,
    },
  },
  orgBaseConfig,
);

sensorSchema.methods.updateStatsForReading = function (this: SensorDocument) {
  if (!this.readingStats) {
    this.readingStats = { first: new Date(), last: new Date(), count: 1 };
  } else {
    if (!this.readingStats.first) {
      this.readingStats.first = new Date();
    }
    this.readingStats.last = new Date();
    this.readingStats.count += 1;
  }
};

sensorSchema.statics.findOneByName = async function (name: string) {
  return this.findOne({ name: name.replace('_', ' ') }).exec();
};

sensorSchema.statics.findOneBySerial = async function (serial: string) {
  return this.findOne({ serial }).exec();
};

sensorSchema.statics.findOneBySerialOrName = async function (value: string) {
  return this.findOne({
    $or: [{ name: value.replace('_', ' ') }, { serial: value }],
  }).exec();
};

sensorSchema.statics.findOneByIdOrSerialOrName = async function (
  this: SensorModel,
  value: string,
) {
  if (mongoose.Types.ObjectId.isValid(value)) {
    return this.findById(value).exec();
  } else {
    return this.findOne({ $or: [{ name: value }, { serial: value }] }).exec();
  }
};

sensorSchema.statics.findByOrganisation = async function (
  organisationId: string | ObjectId,
) {
  if (!mongoose.Types.ObjectId.isValid(organisationId)) {
    return [];
  }

  return this.find({ _organisation: organisationId }).exec();
};

sensorSchema.virtual('organisationId').get(function (this: SensorDocument) {
  const org = this._organisation;
  return org instanceof Organisation ? org.id.toString() : org?.toString();
});

export const Sensor = commonOrgModel.discriminator<SensorDocument, SensorModel>(
  'sensor',
  sensorSchema,
);
