import React from 'react';
import styled from 'styled-components/macro';

const Header = styled.h2`
    font-size: 34px;
    color: ${({ theme }) => theme.active};
`;

export const SectionHeader: React.FC = ({ children }) => (
    <Header>{children}</Header>
);
