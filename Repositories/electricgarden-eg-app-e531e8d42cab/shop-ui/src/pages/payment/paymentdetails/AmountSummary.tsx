import React from 'react';
import { useSelector } from 'react-redux';
import { FREE_TRIAL_MODE } from '../../../constants';

import { CurrencyLarge } from '../../../shared';
import { cartSubscriptionTotalSelector } from '../../cart';

export const AmountSummary: React.FC = () => {
  const subscriptionTotal = useSelector(cartSubscriptionTotalSelector);
  return (
    <>
      {FREE_TRIAL_MODE ? (
        <p>After the completion of the trial period you will be charged</p>
      ) : (
        <p>Pay Electric Garden</p>
      )}
      <p>
        <CurrencyLarge value={subscriptionTotal} /> ex GST
        {FREE_TRIAL_MODE && <> per month</>}
      </p>
      <p>
        An Electric Garden subscription includes a wireless sensor kit, access
        to online resources and support for your school from our team of
        specialists.
      </p>
    </>
  );
};
