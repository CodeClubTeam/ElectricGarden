import mongoose from '../db';

export interface AddressProperties {
  line1: string;
  line2?: string;
  line3?: string;
  country: string;
  city: string;
  postcode: string;
}

export interface AddressDocument extends mongoose.Document, AddressProperties {
  getFullAddress: () => string;
  getProperties: () => AddressProperties;
}

export type AddressModel = mongoose.Model<AddressDocument>;

export const addressSchema = new mongoose.Schema<AddressDocument>({
  line1: {
    type: String,
    required: true,
  },
  line2: String,
  line3: String,
  city: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  postcode: {
    type: String,
    required: true,
  },
});

addressSchema.methods.getFullAddress = function (this: AddressDocument) {
  return Object.entries(this.toObject())
    .filter(([key]) => !key.startsWith('_'))
    .map(([, value]) => value)
    .filter((v) => !!v)
    .join(', ');
};

addressSchema.methods.getProperties = function (
  this: AddressDocument,
): AddressProperties {
  const { line1, line2, line3, city, country, postcode } = this;
  return {
    line1,
    line2,
    line3,
    city,
    country,
    postcode,
  };
};

export const Address = mongoose.model<AddressDocument>(
  'Address',
  addressSchema,
);
