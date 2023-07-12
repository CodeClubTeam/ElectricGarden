import React from 'react';
import styled from 'styled-components/macro';

import { useFetchSale } from '../../api';
import { LoadingSpinner, PageHeading } from '../../shared';
import { TickIcon } from './icons';

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

const EmailAddress = styled.span`
  font-weight: bold;
`;

const HomeLink = styled.a`
  text-transform: lowercase;
  text-decoration: none;
`;

export const SuccessCreditCard: React.FC = () => {
  const fetchSale = useFetchSale();
  if (fetchSale.fetching) {
    return <LoadingSpinner />;
  }
  const { sale } = fetchSale;
  return (
    <Container>
      <IconContainer>
        <TickIcon />
      </IconContainer>
      <PageHeading>Success</PageHeading>
      <p>
        Your {sale.freeTrialDays ? 'credit card authorisation' : 'payment'} was
        successful.
        {sale.freeTrialDays &&
          ' Your card will not be charged until the end of your free trial (unless cancelled).'}
      </p>
      <p>Thank you for your order.</p>
      <p>
        A confirmation email with details regarding your order has been sent to
        <br />
        <EmailAddress>{sale.billingEmail}</EmailAddress>.
      </p>
      <p>You can log into the Electric Garden app now and set up your class.</p>
      <p>
        Click on the link in the invite email sent to
        <br />
        <EmailAddress>{sale.email}</EmailAddress> to log in.
      </p>
      <p>
        <HomeLink href="/">return to home screen</HomeLink>
      </p>
    </Container>
  );
};
