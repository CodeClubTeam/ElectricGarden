import React from 'react';
import styled from 'styled-components/macro';

import { AppCheckboxField } from '../../shared';

const Container = styled.div`
  background: #dffcde;
  border-radius: 2px;
  padding: 1.25em;
  width: 80%;
  margin: 0 auto;
`;

export const AcceptTerms: React.FC = () => {
  return (
    <Container>
      <AppCheckboxField<any>
        name="payment.acceptTerms"
        label={
          <>
            I agree to purchase an Electric Garden subscription and to the{' '}
            <a
              href="https://electricgarden.nz/terms"
              target="_blank"
              rel="noopener noreferrer"
            >
              Terms &amp; Conditions
            </a>
          </>
        }
      />
    </Container>
  );
};
