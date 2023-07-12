import React from 'react';

import { OrderDetails } from '../../../types';
import { CreditCardDetails } from './CreditCardDetails';
import { PurchaseOrderDetails } from './PurchaseOrderDetails';
import { useFormikContext } from 'formik';

export const PaymentDetails: React.FC = () => {
  const {
    values: { payment },
  } = useFormikContext<OrderDetails>();
  const { method } = payment;
  switch (method) {
    case 'po':
      return <PurchaseOrderDetails />;
    case 'cc':
      return <CreditCardDetails />;
    default:
      return null;
  }
};
