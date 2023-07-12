import Stripe from 'stripe';

const isTest = process.env.NODE_ENV === 'test';

if (!process.env.STRIPE_API_KEY) {
  throw new Error('Failed to find stripe api key environment variable.');
}

if (process.env.STRIPE_API_KEY.includes('test') && isTest) {
  throw new Error('Non test api key for testing environment. ABORTING');
}

export const stripe = new Stripe(process.env.STRIPE_API_KEY);
