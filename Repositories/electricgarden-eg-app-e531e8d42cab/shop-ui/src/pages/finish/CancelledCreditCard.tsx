import React, { useCallback } from 'react';
import styled from 'styled-components/macro';
import { useFetchSale } from '../../api';

import { useStripe } from '../../api/useStripe';
import { LoadingSpinner, PageHeading, PrimaryButton } from '../../shared';
import { CrossIcon } from './icons';

const Container = styled.div`
  max-width: 30em;
  margin: 0 auto;
  p,
  h2 {
    text-align: center;
  }
`;

const HomeLink = styled.a`
  text-transform: lowercase;
  text-decoration: none;
`;

const IconContainer = styled.p`
  color: #5bc5e7;
`;

const AltPageHeading = styled(PageHeading)`
  color: #5bc5e7;
`;

export const CancelledCreditCard: React.FC<{ sessionId: string }> = ({
  sessionId,
}) => {
  const { acceptPayment } = useStripe();
  const handleRetry = useCallback(() => {
    acceptPayment(sessionId);
  }, [acceptPayment, sessionId]);

  const fetchSale = useFetchSale();
  if (fetchSale.fetching) {
    return <LoadingSpinner />;
  }
  const { sale } = fetchSale;

  return (
    <Container>
      <IconContainer>
        <CrossIcon />
      </IconContainer>
      <AltPageHeading>Cancelled</AltPageHeading>
      <p>
        Your {sale.freeTrialDays ? 'credit card authorisation' : 'payment'} was
        not completed.
      </p>
      <p>
        <PrimaryButton onClick={handleRetry}>Try again</PrimaryButton>
      </p>
      <p>
        <HomeLink href="/">or return to home screen</HomeLink>
      </p>
    </Container>
  );
};
