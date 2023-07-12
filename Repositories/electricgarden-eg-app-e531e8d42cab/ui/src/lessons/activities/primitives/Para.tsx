import React from 'react';
import styled, { css } from 'styled-components/macro';

type Props = {
    maxWidth?: number;
    color?: string;
    size?: number;
    padding?: string;
    margin?: string;
};

const GappedPara = styled.p<Props>`
    padding: 0.5em;
    margin: 0.5em auto;
    color: ${({ color }) => `${color}`};
    font-size: ${({ size }) => `${size}px`};
    text-align: center;
    vertical-align: middle;
    ${({ maxWidth }) =>
        maxWidth &&
        css`
            max-width: ${maxWidth}rem;
        `}
`;

export const Para: React.FC<Props> = ({ children, ...props }) => (
    <GappedPara {...props}>{children}</GappedPara>
);
