import { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { isEgCartItemProduct } from '../shared';

import {
  Address,
  AppDispatch,
  OrderDetails,
  UnitPricing,
  PaymentMethod,
} from '../types';
import { createHttp, HttpResponseError } from './http';

interface StartCheckoutBody {
  name: string;
  organisationName: string;
  email: string;
  billingEmail?: string;
  billingAddress?: Address;
  shippingAddress: Address;
  numberOfDevices: number;
  paymentMethod: PaymentMethod;
  purchaseOrderNumber?: string;
  includeStrap: boolean;
  paymentFrequency?: 'monthly' | 'annually';
  freeTrialDays?: number;
}

const mapDetailsToCheckoutPayload = ({
  customerDetails: {
    name,
    organisationName,
    email,
    billingEmail,
    billingAddress,
    shippingAddress,
    useDifferentBillingAddress,
    useDifferentBillingEmail,
  },
  payment: { method: paymentMethod, purchaseOrderNumber },
  items,
}: OrderDetails): StartCheckoutBody => {
  const egItem = items.find(isEgCartItemProduct);
  if (!egItem) {
    throw new Error(`EG item not found`);
  }
  const numberOfDevices = egItem.quantity;
  return {
    name,
    organisationName,
    email,
    billingEmail: useDifferentBillingEmail ? billingEmail : undefined,
    billingAddress: useDifferentBillingAddress ? billingAddress : undefined,
    shippingAddress,
    numberOfDevices,
    paymentMethod,
    purchaseOrderNumber,
    includeStrap: false,
    paymentFrequency: egItem.type === 'egft' ? 'monthly' : 'annually',
    freeTrialDays: egItem.type === 'egft' ? 35 : undefined,
  };
};

export const useApi = () => {
  const dispatch = useDispatch<AppDispatch>();
  const handleError = useCallback(
    (error: Error) => {
      if (error instanceof HttpResponseError) {
        dispatch({
          type: 'HTTP_ERROR',
          payload: { response: error.response, error: error },
        });
      } else {
        dispatch({
          type: 'HTTP_ERROR',
          payload: { error: error },
        });
      }
    },
    [dispatch],
  );
  const http = useMemo(() => createHttp(), []);
  return {
    getUnitPricing: useCallback(async () => {
      try {
        const response = await http.get('/unit-pricing');
        return (await response.json()) as UnitPricing;
      } catch (error) {
        handleError(error);
        throw error;
      }
    }, [handleError, http]),
    startCheckout: useCallback(
      async (order: OrderDetails) => {
        try {
          const response = await http.post(
            '/checkout',
            mapDetailsToCheckoutPayload(order),
          );
          return (await response.json()) as { id: string };
        } catch (error) {
          handleError(error);
          throw error;
        }
      },
      [handleError, http],
    ),
    getSale: useCallback(
      async (checkoutId: string) => {
        try {
          const response = await http.get(`/sales/${checkoutId}`);
          return (await response.json()) as SaleDetails;
        } catch (error) {
          handleError(error);
          throw error;
        }
      },
      [handleError, http],
    ),
  };
};

export interface SaleDetails {
  checkoutId: string;
  billingEmail: string;
  email: string;
  paymentMethod: PaymentMethod;
  purchaseOrderNumber?: string;
  paymentFrequency: 'annually' | 'monthly';
  freeTrialDays?: number;
}
