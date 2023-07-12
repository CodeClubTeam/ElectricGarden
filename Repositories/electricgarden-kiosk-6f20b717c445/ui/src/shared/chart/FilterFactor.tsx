import React from 'react';
import styled from 'styled-components/macro';

const Container = styled.div`
    position: absolute;
    bottom: 5px;
    right: 10px;
`;

export const FilterFactor: React.FC<{ value: number }> = ({ value }) => (
    <Container>
        {value === 1
            ? 'Viewing all readings'
            : `Viewing 1 in every ${value} readings`}
    </Container>
);
