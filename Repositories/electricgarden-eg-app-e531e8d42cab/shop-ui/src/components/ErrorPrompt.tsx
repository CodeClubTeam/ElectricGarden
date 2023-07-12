import React, { useCallback } from 'react';
import styled from 'styled-components/macro';
import { PrimaryButton } from '../shared';
import { useSelector, useDispatch } from 'react-redux';
import { errorOrUndefinedSelector } from '../selectors';
import { AppDispatch } from '../types';

const Container = styled.div`
  h2 {
    color: red;
  }
`;

export const ErrorPrompt: React.FC = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const handleDismiss = useCallback(() => {
    dispatch({ type: 'DISMISS_ERROR' });
  }, [dispatch]);
  const { error } = useSelector(errorOrUndefinedSelector);
  if (!error) {
    return <>{children}</>;
  }
  return (
    <Container>
      <h2>Error</h2>
      <p>We're sorry but an unexpected error has occurred.</p>
      <ul>
        {error.messages.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
      <PrimaryButton onClick={handleDismiss}>Dismiss</PrimaryButton>
    </Container>
  );
};
