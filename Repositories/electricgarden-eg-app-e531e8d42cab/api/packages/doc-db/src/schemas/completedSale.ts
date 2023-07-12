import { commonOrgModel } from '../collectionModels';
import { orgBaseConfig } from '../config';
import mongoose from '../db';
import { AddressDocument, addressSchema } from './address';

export interface CompletedSaleDocument extends mongoose.Document {
  checkoutId?: string;
  shippingAddress: AddressDocument;
  billingAddress: AddressDocument;
  billingEmail: string;
  email: string;
  name: string;
  organisationName: string;
  paymentMethod: 'cc' | 'po';
  purchaseOrderNumber?: string;
  completedOn: Date;
  subscriptionId: string;
  stripeCustomerId: string;
  successful: boolean;
  numberOfDevices: number;
  includeStrap: boolean;
  paymentFrequency: 'annually' | 'monthly';
  freeTrialDays?: number;
  _lastUpdated: Date;
}

export interface CompletedSaleModel
  extends mongoose.Model<CompletedSaleDocument> {
  findOneByCheckoutId: (id: string) => Promise<CompletedSaleDocument | null>;
  findOneByBillingEmail: (
    billingEmail: string,
  ) => Promise<CompletedSaleDocument | null>;
  findOneByEmail: (email: string) => Promise<CompletedSaleDocument | null>;
  findOneByEmailOrBillingEmail: (
    email: string,
  ) => Promise<CompletedSaleDocument | null>;
  findOneBySubscriptionId: (
    subscriptionId: string,
  ) => Promise<CompletedSaleDocument | null>;
  findOneByStripeCustomerId: (
    stripeCustomerId: string,
  ) => Promise<CompletedSaleDocument | null>;
}

const completedSaleSchema = new mongoose.Schema<CompletedSaleDocument>(
  {
    checkoutId: {
      type: String,
    },
    shippingAddress: {
      type: addressSchema,
      required: true,
    },
    billingAddress: {
      type: addressSchema,
      required: true,
    },
    subscriptionId: {
      type: String,
      required: false,
    },
    stripeCustomerId: {
      type: String,
      required: false,
    },
    organisationName: {
      type: String,
      required: true,
    },
    purchaseOrderNumber: {
      type: String,
      required: false,
    },
    paymentMethod: {
      type: String,
      enum: ['cc', 'po'],
      required: true,
    },
    billingEmail: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    numberOfDevices: {
      type: Number,
      required: true,
    },
    completedOn: {
      type: Date,
      default: Date.now,
    },
    paymentFrequency: {
      type: String,
      enum: ['annually', 'monthly'],
      default: 'annually',
    },
    freeTrialDays: {
      type: Number,
    },
  },
  orgBaseConfig,
);

completedSaleSchema.statics.findOneByCheckoutId = async function (
  this: CompletedSaleModel,
  checkoutId: string,
) {
  return this.findOne({ checkoutId });
};

// cosmosdb made breaking change where you get an error when sorting on db
// unless there is explicit index. more efficient to do on client
const latestEntry = (entries: CompletedSaleDocument[]) =>
  entries.sort(
    (a, b) => b._lastUpdated.getTime() - a._lastUpdated.getTime(), // descending by last updated (newest first)
  )[0];

completedSaleSchema.statics.findOneByBillingEmail = async function (
  this: CompletedSaleModel,
  billingEmail: string,
) {
  return latestEntry(await this.find({ billingEmail }).exec());
};

completedSaleSchema.statics.findOneByEmailOrBillingEmail = async function (
  this: CompletedSaleModel,
  email: string,
) {
  let obj = await this.findOneByEmail(email);
  if (obj == null) {
    obj = await this.findOneByBillingEmail(email);
  }
  return obj;
};

completedSaleSchema.statics.findOneByEmail = async function (
  this: CompletedSaleModel,
  email: string,
) {
  return latestEntry(await this.find({ email }).exec());
};

completedSaleSchema.statics.findOneBySubscriptionId = async function (
  this: CompletedSaleModel,
  subscriptionId: string,
) {
  return this.findOne({ subscriptionId });
};

completedSaleSchema.statics.findOneByStripeCustomerId = async function (
  this: CompletedSaleModel,
  stripeCustomerId: string,
) {
  return this.findOne({ stripeCustomerId });
};

completedSaleSchema.pre<CompletedSaleDocument>('save', function (next) {
  this._lastUpdated = new Date(Date.now());
  next();
});

export const CompletedSale = commonOrgModel.discriminator<
  CompletedSaleDocument,
  CompletedSaleModel
>('completedSale', completedSaleSchema);
