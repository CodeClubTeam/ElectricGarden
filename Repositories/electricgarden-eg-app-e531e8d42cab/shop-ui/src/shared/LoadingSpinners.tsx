import React from 'react';
import Spinner from 'react-svg-spinner';
import styled from 'styled-components/macro';

const BigContainer = styled.div`
  margin-top: 10em; /* should vertically center properly but in a hurry */
  text-align: center;
  p {
    text-align: center;
  }
`;

export const FullScreenLoadingSpinner: React.FC = ({ children }) => (
  <BigContainer>
    <Spinner size="100px" />
    {children || <p>Loading please wait...</p>}
  </BigContainer>
);

export const LoadingSpinner: React.FC = ({ children }) => (
  <div>
    <Spinner size="12px" />
    {children || <p>Loading please wait...</p>}
  </div>
);
