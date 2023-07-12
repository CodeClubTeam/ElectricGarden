import { Product } from '@eg/doc-db';
import products from './salesProducts.json';

export const ensureProductsLoaded = async () => {
  // Load products
  if (!(products instanceof Array)) {
    throw new Error('Products must be an array type.');
  }
  const skuList = [];
  for (const product of products) {
    if (product.sku == null) {
      throw new Error(`No sku found on ${JSON.stringify(product)}`);
    }
    skuList.push(product.sku);
  }
  const existingProducts = await Product.find();
  let removeCount = 0;
  for (const existingProduct of existingProducts) {
    if (existingProduct.sku == null) {
      await existingProduct.remove();
      continue;
    }
    if (skuList.indexOf(existingProduct.sku) < 0) {
      // Product in DB does not exist in file. Delete.
      await existingProduct.remove();
      removeCount++;
    }
  }
  let updateCount = 0;
  let newCount = 0;
  for (const product of products) {
    const existingProduct = await Product.findOneBySku(product.sku);
    if (existingProduct == null) {
      const newProduct = new Product({
        name: product.name,
        sku: product.sku,
        description: product.description,
        priceCents: product.priceCents,
        category: product.category,
        imageUrl: product.imageUrl,
      });
      await newProduct.save();
      newCount++;
      continue;
    }
    existingProduct.name = product.name;
    existingProduct.sku = product.sku;
    existingProduct.description = product.description;
    existingProduct.priceCents = product.priceCents;
    existingProduct.category = product.category;
    // existingProduct.imageUrl = product.imageUrl;
    updateCount++;
    await existingProduct.save();
  }
  console.log(
    `Product types: ${newCount} added, ${updateCount} updated, ${removeCount} removed`,
  );
};
