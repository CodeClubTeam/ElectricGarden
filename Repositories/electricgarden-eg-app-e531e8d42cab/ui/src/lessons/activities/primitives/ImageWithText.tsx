import React from 'react';
import styled from 'styled-components/macro';

type props = {
    text?: string;
    fontSize?: number;
};

const Container = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin: 5px 5px;
`;

export const SquareImage = styled.img`
    border: solid 3px #ec008c;
    border-radius: 5px;
    width: 150px;
    height: 150px;
    justify-content: center;
    align-self: center;
`;

export const ImageText = styled.div<props>`
    display: flex;
    align-items: center;
    width: 150px;
    height: 36px;
    background: var(--match-color, #ec008c);
    color: white;
    font-size:  ${({fontSize}) => fontSize ? `{fontSize}px` : '16px'};
    border-radius: 5px;
    justify-content: center;
    margin-top: 5px;
    text-align: center;
    align-self: center;
`;

export const ImageWithText: React.FC<props> = ({ text, fontSize, ...props }) => (
    <Container>
        <SquareImage {...props}></SquareImage>
        <ImageText fontSize={fontSize}>{text}</ImageText>
    </Container>
);
