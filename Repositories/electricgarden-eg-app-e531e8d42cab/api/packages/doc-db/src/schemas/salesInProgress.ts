import mongoose from '../db';
import { orgBaseConfig } from '../config';
import { commonOrgModel } from '../collectionModels';
import { AddressDocument, addressSchema } from './address';

export interface ProductsOrdered {
  sku: string;
  amount: number;
}

export interface SaleInProgressDocument extends mongoose.Document {
  checkoutId: string;
  shippingAddress: AddressDocument;
  billingAddress?: AddressDocument;
  billingEmail?: string;
  email: string;
  organisationName: string;
  paymentMethod: 'cc' | 'po';
  purchaseOrderNumber?: string;
  name: string;
  numberOfDevices: number;
  includeStrap: boolean;
  includedSubscription: boolean;
  paymentFrequency: 'annually' | 'monthly';
  freeTrialDays?: number;
  _lastUpdated: Date;
  readonly _created: Date;
}

export interface SaleInProgressModel
  extends mongoose.Model<SaleInProgressDocument> {
  findOneByCheckoutId: (id: string) => Promise<SaleInProgressDocument | null>;
  findOneByBillingEmail: (
    billingEmail: string,
  ) => Promise<SaleInProgressDocument | null>;
  findOneByEmail: (email: string) => Promise<SaleInProgressDocument | null>;
  findOneByEmailOrBillingEmail: (
    email: string,
  ) => Promise<SaleInProgressDocument | null>;
}

export const productOrderedSchema = new mongoose.Schema<ProductsOrdered>({
  sku: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
});

const saleInProgressSchema = new mongoose.Schema<SaleInProgressDocument>(
  {
    checkoutId: {
      type: String,
      required: true,
    },
    shippingAddress: {
      type: addressSchema,
      required: true,
    },
    billingAddress: addressSchema,
    purchaseOrderNumber: {
      type: String,
      required: false,
    },
    paymentMethod: {
      type: String,
      enum: ['cc', 'po'],
      required: true,
    },
    billingEmail: String,
    email: {
      type: String,
      required: true,
    },
    organisationName: {
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
    includedSubscription: {
      type: Boolean,
      required: true,
    },
    paymentFrequency: {
      type: String,
      enum: ['annually', 'monthly'],
      default: 'annually',
    },
    freeTrialDays: {
      type: Number,
    },
    _created: {
      type: Date,
      default: Date.now,
    },
    _lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  orgBaseConfig,
);

saleInProgressSchema.statics.findOneByCheckoutId = async function (
  this: SaleInProgressModel,
  id: string,
) {
  return this.findOne({ checkoutId: id });
};

// cosmosdb made breaking change where you get an error when sorting on db
// unless there is explicit index. more efficient to do on client
const latestEntry = (entries: SaleInProgressDocument[]) =>
  entries.sort(
    (a, b) => b._lastUpdated.getTime() - a._lastUpdated.getTime(), // descending by last updated (newest first)
  )[0];

saleInProgressSchema.statics.findOneByBillingEmail = async function (
  this: SaleInProgressModel,
  billingEmail: string,
) {
  return latestEntry(await this.find({ billingEmail }).exec());
};

saleInProgressSchema.statics.findOneByEmail = async function (
  this: SaleInProgressModel,
  email: string,
) {
  return latestEntry(await this.find({ email }));
};

saleInProgressSchema.statics.findOneByEmailOrBillingEmail = async function (
  this: SaleInProgressModel,
  email: string,
) {
  let obj = await this.findOneByEmail(email);
  if (obj == null) {
    obj = await this.findOneByBillingEmail(email);
  }
  return obj;
};

saleInProgressSchema.pre<SaleInProgressDocument>('save', function (next) {
  this._lastUpdated = new Date(Date.now());
  next();
});

export const SaleInProgress = commonOrgModel.discriminator<
  SaleInProgressDocument,
  SaleInProgressModel
>('saleInProgress', saleInProgressSchema);
