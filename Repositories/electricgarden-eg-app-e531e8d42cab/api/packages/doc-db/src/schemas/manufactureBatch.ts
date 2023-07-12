import mongoose from '../db';
import { metaBaseConfig } from '../config';
import { commonMetaModel } from '../collectionModels';

export interface BatchDocument extends mongoose.Document {
  _batch: number;
  units: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface BatchModel extends mongoose.Model<BatchDocument> {}

const batchSchema = new mongoose.Schema(
  {
    _batch: Number,
    units: Number,
    deviceCount: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
    },
    updated: String,
  },
  metaBaseConfig,
);

export const ManufactureBatch = commonMetaModel.discriminator<
  BatchDocument,
  BatchModel
>('batch', batchSchema);
