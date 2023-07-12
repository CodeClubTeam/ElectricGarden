import { Address } from '../../types';

export type CustomerDetails = {
  name: string;
  organisationName: string;
  email: string;
  newsletterOptIn: boolean;
  useDifferentBillingEmail: boolean;
  billingEmail: string;
  useDifferentBillingAddress: boolean;
  billingAddress: Address;
  shippingAddress: Address;
};
