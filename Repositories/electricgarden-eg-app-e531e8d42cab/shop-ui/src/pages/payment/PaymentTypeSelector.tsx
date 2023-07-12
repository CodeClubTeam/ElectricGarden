import React from 'react';
import styled from 'styled-components/macro';

import { PaymentOption } from './PaymentOption';

const PurchaseOrderBlurb = styled.p`
  font-weight: 300;
  color: #bdbdbd;
  max-width: 30em;
`;

export const PaymentTypeSelector: React.FC = () => {
  return (
    <>
      <p>Choose your subscription payment options:</p>

      <PaymentOption method="cc" label="Credit Card" />
      <PaymentOption method="po" label="Purchase Order">
        <PurchaseOrderBlurb>
          New Zealand schools may provide a purchase order number to create an
          Electric Garden subscription.
        </PurchaseOrderBlurb>
      </PaymentOption>
    </>
  );
};
