import React from 'react';
import { useSelector } from 'react-redux';
import { creditCardFinishResultSelector } from './selectors';
import { SuccessCreditCard } from './SuccessCreditCard';
import { CancelledCreditCard } from './CancelledCreditCard';

export const CreditCardFinish: React.FC = () => {
  const creditCardResult = useSelector(creditCardFinishResultSelector);
  if (creditCardResult) {
    switch (creditCardResult.status) {
      case 'success':
        return <SuccessCreditCard />;
      case 'cancelled':
        return <CancelledCreditCard sessionId={creditCardResult.checkoutId} />;
    }
  }
  throw new Error(
    'Credit card finish but no result. Check redirect url template for stripe?',
  );
};
