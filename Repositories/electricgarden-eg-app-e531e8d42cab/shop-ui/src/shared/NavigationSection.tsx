import React from 'react';
import styled from 'styled-components/macro';

import { BackButton } from './BackButton';

export const Container = styled.div`
  text-align: right;
  padding: 1.5em;

  button {
    margin: 0.5em;
  }
`;

export const NavigationSection: React.FC<{ noBack?: boolean }> = ({
  children,
  noBack,
}) => (
  <Container>
    {!noBack && <BackButton />}
    {children}
  </Container>
);
