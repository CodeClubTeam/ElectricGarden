import { PaymentMethod } from '../../types';

export type PaymentDetails = {
  method: PaymentMethod;
  purchaseOrderNumber: string;
  acceptTerms: boolean;
};
