import { Product } from '@eg/doc-db';

const egShippingSku = 'egship001';

export const getShippingUnitPrice = async () => {
  const shippingProduct = await Product.findOneBySku(egShippingSku);
  if (!shippingProduct) {
    throw new Error(`No shipping product found with sku: ${egShippingSku}`);
  }
  return shippingProduct.priceCents / 100;
};
