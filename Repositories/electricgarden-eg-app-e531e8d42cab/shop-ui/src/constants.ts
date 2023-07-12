import { Address, OrderFormDetails, Product } from './types';

export const FREE_TRIAL_MODE = window.location.search.includes('cp=FT2102');

export const products: Product[] = [
  {
    type: FREE_TRIAL_MODE ? 'egft' : 'eg',
    price: 0,
    subscription: true,
  },
];

const initialAddress: Address = {
  line1: '',
  line2: '',
  line3: '',
  city: '',
  postcode: '',
  country: 'New Zealand',
};

// have to use empty strings for the form
export const initialOrderDetails: OrderFormDetails = {
  customerDetails: {
    name: '',
    organisationName: '',
    email: '',
    newsletterOptIn: true,
    useDifferentBillingEmail: false,
    billingEmail: '',
    useDifferentBillingAddress: false,
    billingAddress: initialAddress,
    shippingAddress: initialAddress,
  },
  payment: {
    method: 'cc',
    purchaseOrderNumber: '',
    acceptTerms: false,
  },
};

export const STATE_PERSISTENCE_KEY = 'EG_SHOP';
export const FORM_STATE_PERSISTENCE_KEY = 'EG_SHOP_FORM';
