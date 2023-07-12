import React from 'react';
import styled from 'styled-components/macro';

const Container = styled.div`
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const Indicator = styled.div`
    font-size: 36px;
    display: inline;
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 10px 20px;
    border-radius: 20px;
    box-shadow: 0 0 20px -1px black;
`;

export const ChartLoadingIndicator: React.FC = () => (
    <Container>
        <Indicator> LOADING...</Indicator>
    </Container>
);
