import React from 'react';
import styled from 'styled-components/macro';

const Container = styled.div`
    background-color: #2ed03c;
    border-radius: 4px;
    padding: 0;
    box-shadow: inset 0 -1px 1px rgba(255, 255, 255, 0.3);
    --height: 20px;
`;

const Bar = styled.span`
    display: block;
    height: var(--height);
    border-top-right-radius: 2px;
    border-bottom-right-radius: 2px;
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
    background-color: #00a8b5;
    margin-top: -20px;
`;

const Content = styled.span`
    color: white;
    font-weight: 300;
    line-height: 100%;
    padding: 0.3em 0;
    margin-top: calc(var(--height) * -1);
`;

export const ProgressBar: React.FC<{ percent: number }> = ({
    percent,
    children,
}) => (
    <Container>
        <Content>{children || `${percent}% completed`}</Content>
        <Bar style={{ width: `${percent}%` }} />
    </Container>
);
