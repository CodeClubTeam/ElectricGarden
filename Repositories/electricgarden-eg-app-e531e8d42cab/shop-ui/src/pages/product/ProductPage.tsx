import React from 'react';
import styled from 'styled-components/macro';

import {
  NavigationSection,
  NextPageButton,
  FullScreenLoadingSpinner,
} from '../../shared';
import { Products } from './Products';
import { Prompt } from './Prompt';
import { useRetrievePricing } from '../../api';

const Container = styled.div``;

const ProductsPanel = styled.div`
  background: #f2f2f2;
  padding: 1em;
`;

export const ProductPage: React.FC = () => {
  const fetching = useRetrievePricing();
  if (fetching) {
    return <FullScreenLoadingSpinner />;
  }
  return (
    <Container>
      <Prompt />
      <ProductsPanel>
        <Products />
        <NavigationSection noBack>
          <NextPageButton />
        </NavigationSection>
      </ProductsPanel>
    </Container>
  );
};
