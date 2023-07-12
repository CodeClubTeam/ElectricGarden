import React from 'react';
import styled from 'styled-components/macro';

import { NavigationSection, NextPageButton } from '../../shared';
import { CartItemTable } from './CartItemTable';
import { CartTotals } from './CartTotals';

const Container = styled.div``;

export const ShoppingCartPage: React.FC = () => {
  return (
    <Container>
      <CartItemTable />
      <CartTotals />
      <NavigationSection>
        <NextPageButton />
      </NavigationSection>
    </Container>
  );
};
