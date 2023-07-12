import express from 'express';
import asyncHandler from 'express-async-handler';

import * as checkout from './routes/checkout';
import * as pricing from './routes/pricing';
import * as sales from './routes/sales';

export const api = express.Router();

api.post('/checkout', asyncHandler(checkout.startCheckoutSession));
api.get('/checkout/products', asyncHandler(checkout.getProducts));
api.get('/unit-pricing', asyncHandler(pricing.getUnitPricing));
api.get('/sales/:checkoutId', asyncHandler(sales.getSaleByCheckoutId));
api.get('/ping', (req, res) => res.sendStatus(200));
