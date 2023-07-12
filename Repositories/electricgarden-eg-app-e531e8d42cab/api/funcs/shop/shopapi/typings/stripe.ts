import { IObject } from 'stripe';

export interface CheckoutEventData extends IObject {
  id: string;
  customer: string;
  // eslint-disable-next-line camelcase
  customer_email: string;
  subscription: string;
}
