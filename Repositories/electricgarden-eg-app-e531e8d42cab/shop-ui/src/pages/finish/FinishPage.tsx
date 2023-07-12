import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { CreditCardFinish } from './CreditCardFinish';
import { PurchaseOrderFinish } from './PurchaseOrderFinish';
import { paymentMethodSelector } from './selectors';

export const FinishPage: React.FC = () => {
  const paymentMethod = useSelector(paymentMethodSelector);

  useEffect(() => {
    window.localStorage.clear();
  }, []);
  switch (paymentMethod) {
    case 'cc':
      return <CreditCardFinish />;
    case 'po':
      return <PurchaseOrderFinish />;
    default:
      throw new Error(`Payment method has no finish page: ${paymentMethod}.`);
  }
};
