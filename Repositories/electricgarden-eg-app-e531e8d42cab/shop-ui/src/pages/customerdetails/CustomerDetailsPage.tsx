import React from 'react';
import styled from 'styled-components/macro';

import {
  BorderedBlock,
  NavigationSection,
  NextPageSubmitButton,
  PageHeading,
} from '../../shared';
import { DetailsFields } from './DetailsFields';

const Container = styled.div``;

const ContentContainer = styled(BorderedBlock)``;

export const CustomerDetailsPage: React.FC = () => (
  <Container>
    <ContentContainer>
      <PageHeading>My Details</PageHeading>
      <DetailsFields />
    </ContentContainer>
    <NavigationSection>
      <NextPageSubmitButton section="customerDetails">
        Continue to Payment
      </NextPageSubmitButton>
    </NavigationSection>
  </Container>
);
