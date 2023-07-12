import { commonTransactionModel } from '../collectionModels';
import { transactionBaseConfig } from '../config';
import mongoose from '../db';
import { Growable, GrowableDocument } from './growable';
import { User, UserDocument } from './user';

export type ObservationValue =
  | { type: string; data: unknown }
  | { type: 'photograph'; data: { assetId: string } }; // server side needs to know about photos for signed urls

export interface ObservationDocument extends mongoose.Document {
  growable: mongoose.Types.ObjectId | GrowableDocument;
  value: ObservationValue;
  comments?: string;
  occurredOn: Date;
  recordedOn: Date;
  recordedBy: mongoose.Types.ObjectId | UserDocument;
  createdOn: Date;

  readonly growableId: mongoose.Types.ObjectId;
  readonly recordedByUser: UserDocument;
  readonly growableDoc: GrowableDocument; // should have called growable _growable?
}

export interface ObservationModel extends mongoose.Model<ObservationDocument> {
  findByGrowableId: (growableId: string) => Promise<ObservationDocument[]>;
  findByRecordingUserId: (userId: string) => Promise<ObservationDocument[]>;
}

const observationSchema = new mongoose.Schema(
  {
    growable: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Growable.modelName,
      required: true,
    },
    value: {
      type: Object,
      required: true,
    },
    comments: {
      type: String,
    },
    occurredOn: {
      type: Date,
      required: true,
    },
    recordedOn: {
      type: Date,
      required: true,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: User.modelName,
    },
    createdOn: {
      type: Date,
      default: Date.now,
    },
  },
  transactionBaseConfig,
);

observationSchema.statics.findByRecordingUserId = function (userId: string) {
  return this.find({ recordedBy: userId }).populate('recordedBy').exec();
};

observationSchema.statics.findByGrowableId = function (growableId: string) {
  return (
    this.find({ growable: growableId })
      .populate('recordedBy')
      // .sort('-recordedOn')
      .exec()
  );
};

observationSchema
  .virtual('growableId')
  .get(function (this: ObservationDocument) {
    const growable = this.growable;
    return growable instanceof Growable ? growable._id : growable;
  });

observationSchema
  .virtual('recordedByUser')
  .get(function (this: ObservationDocument): UserDocument {
    const recordedBy = this.recordedBy;
    if (!(recordedBy instanceof User)) {
      throw new Error(
        'Expected observation to have recordedBy populated in call to "recordedByUser"',
      );
    }
    return recordedBy;
  });

observationSchema
  .virtual('growableDoc')
  .get(function (this: ObservationDocument): GrowableDocument {
    const growable = this.growable;
    if (!(growable instanceof Growable)) {
      throw new Error(
        'Expected observation to have growable populated in call to "growableDoc"',
      );
    }
    return growable;
  });

export const Observation = commonTransactionModel.discriminator<
  ObservationDocument,
  ObservationModel
>('observation', observationSchema);
