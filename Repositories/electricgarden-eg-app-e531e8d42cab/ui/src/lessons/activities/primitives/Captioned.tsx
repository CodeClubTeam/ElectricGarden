import React from 'react';
import styled, { css } from 'styled-components/macro';
import './Captioned.css';

const Container = styled.p<Props>`
    font-family: ${({font}) => font ? font : 'Caveat'}, cursive;
    font-size: ${({size}) => size ? `${size}px` : '40px'};
    font-weight: 400;
    color: ${({color}) => color ? color : '#ec008c'};
    text-align: ${({align}) => align ? align : 'center'};
    margin: 0;
    ${({border}) => border && css`border: 2px solid black;
    border-radius: 5px;
    padding: 1em;
    max-width: fit-content;`}
`;

type Props = {
    children?: React.ReactChild;
    font?: string;
    size?: number;
    color?: string;
    align?: string;
    border?: boolean;
};

export const Captioned: React.FC<Props> = ({ children, font, size, color, align, border }: Props) => (
    <Container font={font} size={size} color={color} align={align} border={border}>{children}</Container>
);
