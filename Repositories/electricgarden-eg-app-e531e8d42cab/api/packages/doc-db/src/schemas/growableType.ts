import mongoose from '../db';
import { commonMetaModel } from '../collectionModels';

export interface GrowableTypeDocument extends mongoose.Document {
  name: string; // for types on ui side maybe?
  title: string;
  observables: string[];
  createdOn: Date;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface GrowableTypeModel
  extends mongoose.Model<GrowableTypeDocument> {
  findOneByName: (name: string) => Promise<GrowableTypeDocument | null>;
}

const growableTypeSchema = new mongoose.Schema<GrowableTypeDocument>({
  name: {
    type: String,
    required: true,
    // unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  observables: {
    type: [String],
    required: true,
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
});

growableTypeSchema.statics.findOneByName = function (
  this: GrowableTypeModel,
  name: string,
) {
  return this.findOne({ name }).exec();
};

export const GrowableType = commonMetaModel.discriminator<
  GrowableTypeDocument,
  GrowableTypeModel
>('growableType', growableTypeSchema);
