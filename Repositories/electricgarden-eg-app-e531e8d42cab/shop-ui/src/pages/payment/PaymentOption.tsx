import React from 'react';
import styled from 'styled-components/macro';

import { PaymentMethod } from '../../types';
import { Field } from 'formik';

const Container = styled.div`
  label {
    span {
      padding-left: 1em;
    }
  }
  margin-top: 1em;
`;

const ExplainerContentContainer = styled.div`
  margin-left: 2em; /* magic number to match radio plus space and line up with label */
`;

export const PaymentOption: React.FC<{
  method: PaymentMethod;
  label: string;
}> = ({ method, label, children }) => (
  <Container>
    <label>
      <Field type="radio" name="payment.method" value={method} />
      <span>{label}</span>
    </label>
    {children && (
      <ExplainerContentContainer>{children}</ExplainerContentContainer>
    )}
  </Container>
);
