import React from 'react';
import styled from 'styled-components/macro';
import './Captioned.css';

type Props = {
    title?: string;
    subtitle?: string;
    height?: number;
    width?: number;
};

const Container = styled.div<Props>`
    display: flex;
    flex-direction: column;
    margin: 5px 5px;
    border: solid 3px #ec008c;
    border-radius: 5px;
    height: ${({height}) => height ? `${height}px` : '270px'};
    width: ${({width}) => width ? `${width}px` : '200px'};
`;

const Title = styled.div<Props>`
    color: #ec008c;
    font-size: 34px;
    font-weight: 900;
    font-family: 'Caveat', cursive;
    justify-content: center;
    text-align: center;
`;

const Subtitle = styled.div<Props>`
    color: #ec008c;
    font-size: 18px;
    border-radius: 5px;
    justify-content: center;
    text-align: center;
`;

export const MatchingBox: React.FC<Props> = ({ title, subtitle, height, width }) => (
    <Container height={height} width={width}>
        <Title>{title}</Title>
        {subtitle && <Subtitle>{subtitle}</Subtitle>}
    </Container>
);
