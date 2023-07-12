import React from 'react';
import styled from 'styled-components/macro';
import { FREE_TRIAL_MODE } from '../../constants';

import {
  BorderedBlock,
  NavigationSection,
  PageHeading,
  SubmitButton,
} from '../../shared';
import { AcceptTerms } from './AcceptTerms';
import { PaymentDetails } from './paymentdetails/PaymentDetails';
import { PaymentTypeSelector } from './PaymentTypeSelector';

const Container = styled.div``;

const ContentContainer = styled(BorderedBlock)``;

export const PaymentPage: React.FC = () => (
  <Container>
    <ContentContainer>
      <PageHeading>My Payment Options</PageHeading>
      {FREE_TRIAL_MODE && (
        <>
          <p>
            We require users to provide payment details to access our free
            trial.
          </p>
          <p>
            You will not be charged if you choose to discontinue use at the
            completion of the trial period.
          </p>
        </>
      )}
      <PaymentTypeSelector />
    </ContentContainer>
    <ContentContainer>
      <PaymentDetails />
    </ContentContainer>
    <AcceptTerms />
    <NavigationSection>
      <SubmitButton>Subscribe</SubmitButton>
    </NavigationSection>
  </Container>
);
