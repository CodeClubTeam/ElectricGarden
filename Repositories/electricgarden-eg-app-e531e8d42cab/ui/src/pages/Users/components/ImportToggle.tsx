import React from 'react';
import styled from 'styled-components/macro';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    text-align: center;
`;

const Toggle = styled.div`
    color: #ec008c;
    cursor: pointer;
    user-select: none;
`;

type Props = {
    on: boolean;
    onToggle: () => void;
    children: React.ReactNode;
};

export const ImportToggle = ({ on, onToggle, children }: Props) => (
    <Container>
        {!on && children}
        <Toggle onClick={onToggle}>
            {on ? '< go back' : 'import csv file'}
        </Toggle>
    </Container>
);
