import mongoose from '../db';
import { commonOrgModel } from '../collectionModels';
import { Organisation, OrgDocument } from './organisation';
import { User, UserDocument } from './user';

export interface SubscriptionDocument extends mongoose.Document {
  _id: string;
  _organisation: mongoose.Types.ObjectId | OrgDocument;
  subscriptionStatus: string;
  billingEmail: string;
  _adminUser: mongoose.Types.ObjectId | UserDocument;
  readonly stripeSubscriptionId: string;
  stripeCustomerId: string;
  isActive: boolean;
  source: string;
  _lastUpdated: Date;
  expiryDate: Date;
  readonly _created: Date;
  readonly organisation: OrgDocument;
  readonly adminUser: UserDocument;
}

export interface SubscriptionModel
  extends mongoose.Model<SubscriptionDocument> {
  findOneByOrgId: (id: string) => Promise<SubscriptionDocument | null>;
  findOneBySubscriptionId: (id: string) => Promise<SubscriptionDocument | null>;
}

const subscriptionSchema = new mongoose.Schema<SubscriptionDocument>({
  _id: {
    // Using id to store Stripe's subscription id so we dont duplicate that.
    type: String,
    required: true,
  },
  _organisation: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: Organisation.modelName,
  },
  subscriptionStatus: {
    type: String,
    required: true,
  },
  stripeCustomerId: {
    type: String,
    required: true,
  },
  billingEmail: {
    type: String,
    required: true,
  },
  source: {
    type: String,
    required: true,
    default: 'stripe',
  },
  isActive: {
    type: Boolean,
    required: true,
  },
  _adminUser: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: User.modelName,
  },
  _lastUpdated: {
    type: Date,
    default: Date.now,
  },
  expiryDate: {
    type: Date,
    required: false,
  },
  _created: {
    type: Date,
    default: Date.now,
  },
});

subscriptionSchema
  .virtual('organisation')
  .get(function (this: SubscriptionDocument) {
    const org = this._organisation;
    if (!(org instanceof Organisation)) {
      throw new Error(
        "Call populate() on user to load 'organisation' property.",
      );
    }
    return org;
  });

subscriptionSchema
  .virtual('adminUser')
  .get(function (this: SubscriptionDocument) {
    const adminUser = this._adminUser;
    if (!(adminUser instanceof User)) {
      throw new Error("Call populate() on user to load 'adminUser' property.");
    }
    return adminUser;
  });

subscriptionSchema.statics.findOneByOrgId = async function (
  _organisation: string,
) {
  return this.findOne({ _organisation });
};

subscriptionSchema.statics.findOneBySubscriptionId = async function (
  stripeSubscriptionId: string,
) {
  return this.findOne({ _id: stripeSubscriptionId });
};

subscriptionSchema.statics.findOneByCustomerId = async function (
  stripeCustomerId: string,
) {
  return this.findOne({ stripeCustomerId });
};

subscriptionSchema.virtual('stripeSubscriptionId', function (
  this: SubscriptionDocument,
) {
  return this._id;
});

subscriptionSchema.pre<SubscriptionDocument>('save', function (next) {
  this._lastUpdated = new Date(Date.now());
  next();
});

export const Subscription = commonOrgModel.discriminator<
  SubscriptionDocument,
  SubscriptionModel
>('subscription', subscriptionSchema);
