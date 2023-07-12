import { getRequiredConfig } from '@eg/core';
import Stripe from 'stripe';

const isTest = process.env.NODE_ENV === 'test';
const stripeApiKey = getRequiredConfig('STRIPE_API_KEY');
if (stripeApiKey.indexOf('test') < 0 && isTest) {
  throw new Error('Non test api key for testing environment. ABORTING');
}

export const stripe = new Stripe(stripeApiKey);
