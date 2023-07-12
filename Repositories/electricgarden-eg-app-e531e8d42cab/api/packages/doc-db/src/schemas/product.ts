import { commonMetaModel } from '../collectionModels';
import mongoose from '../db';

export interface ProductDocument extends mongoose.Document {
  name: string;
  sku: string;
  description: string;
  priceCents: number;
  imageUrl: string;
  category: string;
}

export interface ProductModel extends mongoose.Model<ProductDocument> {
  findOneBySku: (sku: string) => Promise<ProductDocument | null>;
  findOneByName: (name: string) => Promise<ProductDocument | null>;
  findBySkus: (skus: string[]) => Promise<ProductDocument[]>;
}

const productSchema = new mongoose.Schema<ProductDocument>({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  priceCents: {
    type: Number,
    required: true,
  },
  sku: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
  },
});

productSchema.statics.findOneBySku = async function (
  this: ProductModel,
  sku: string,
) {
  return this.findOne({ sku });
};

productSchema.statics.findOneByName = function (
  this: ProductModel,
  name: string,
) {
  return this.findOne({ name });
};

productSchema.statics.findBySkus = function (
  this: ProductModel,
  skus: string[],
) {
  return this.find().where('sku').in(skus);
};

export const Product = commonMetaModel.discriminator<
  ProductDocument,
  ProductModel
>('product', productSchema);
