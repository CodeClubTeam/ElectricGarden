import React from 'react';
import styled from 'styled-components/macro';

import { AppField, FieldContainer } from '../../../shared';
import { AmountSummary } from './AmountSummary';

export const IndentedFieldContainer = styled(FieldContainer)`
  margin-bottom: 1em;
  margin-left: 3em;
  margin-top: 2em;
  max-width: 50em;
`;

export const PurchaseOrderDetails: React.FC = () => (
  <>
    <AmountSummary />

    <IndentedFieldContainer>
      <AppField
        label="Purchase Order Number"
        name="payment.purchaseOrderNumber"
        type="text"
        placeholder="Enter your purchase order number here"
      />
    </IndentedFieldContainer>
  </>
);
