import mongoose from '../db';
import { metaBaseConfig } from '../config';
import { commonMetaModel } from '../collectionModels';

export interface LogDocument extends mongoose.Document {
  timestamp: string;
  machine: string;
  user: string;
  serial: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface LogModel extends mongoose.Model<LogDocument> {}

const logSchema = new mongoose.Schema(
  {
    timestamp: String,
    machine: String,
    user: String,
    record: {
      message: String,
      level: String,
      filename: String,
      module: String,
      func: String,
      line: Number,
      args: [String],
      format: String,
    },
    invocation: String,
    serial: String,
  },
  metaBaseConfig,
);

export const ManufactureLog = commonMetaModel.discriminator<
  LogDocument,
  LogModel
>('log', logSchema);
