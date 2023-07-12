import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components/macro';

import { FREE_TRIAL_MODE } from '../../constants';
import { PageHeading } from '../../shared';
import { TickIcon } from './icons';
import { orderDetailsSelector } from './selectors';

const Container = styled.div`
  max-width: 30em;
  margin: 0 auto;
  p,
  h2 {
    text-align: center;
  }
`;

const IconContainer = styled.p`
  color: #2ed03c;
`;

const TextHighlight = styled.span`
  font-weight: bold;
`;

const HomeLink = styled.a`
  text-transform: lowercase;
  text-decoration: none;
`;

export const PurchaseOrderFinish: React.FC = () => {
  const {
    customerDetails: { billingEmail },
    payment: { purchaseOrderNumber },
  } = useSelector(orderDetailsSelector);

  return (
    <Container>
      <IconContainer>
        <TickIcon />
      </IconContainer>
      <PageHeading>Success</PageHeading>
      <p>Thank you for your order.</p>
      <p>
        An invoice will be generating using the purchase order number you
        provided: <TextHighlight>{purchaseOrderNumber}</TextHighlight> and be
        sent to the billing email address (
        <TextHighlight>{billingEmail}</TextHighlight>){' '}
        {FREE_TRIAL_MODE
          ? 'at the end of your free trial unless cancelled.'
          : 'within one business day.'}
      </p>
      <p>
        <HomeLink href="/">return to home screen</HomeLink>
      </p>
    </Container>
  );
};
