import React from 'react';
import styled, { css } from 'styled-components/macro';

type Props = {
    maxWidth?: number;
    minWidth?: string;
};

const MAX_WIDTH_FRACTION = 0.6; // temp hack until sort out CSS with bootstrap 4 messing things up

const BlockPara = styled.p<Props>`
    padding: 0.5em;
    margin: 0.25em auto;
    color: ${({ theme }) => theme.btn.primary.fg};
    background: var(--match-color);
    border-radius: 4px;
    font-size: 16px;
    align-items: center;
    justify-content: center;
    display: flex;
    text-align: center;
    box-shadow: var(--box-shadow);
    min-width: ${({ minWidth }) => minWidth ? minWidth : '100%'};
    ${({ maxWidth }) =>
        maxWidth &&
        css`
            max-width: ${maxWidth * MAX_WIDTH_FRACTION}rem;
        `}
`;

export const TextBox: React.FC<Props> = ({ children, ...props }) => (
    <BlockPara {...props}>{children}</BlockPara>
);
