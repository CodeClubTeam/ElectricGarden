import React from 'react';
import styled from 'styled-components/macro';

import { AmountSummary } from './AmountSummary';

const Container = styled.div`
  display: flex;
`;

export const CreditCardDetails: React.FC = () => (
  <Container>
    <div>
      <AmountSummary />
    </div>
  </Container>
);
