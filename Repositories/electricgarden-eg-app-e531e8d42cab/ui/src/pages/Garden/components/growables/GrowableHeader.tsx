import React from 'react';
import styled from 'styled-components/macro';

import { useSelectedGrowable } from '../../hooks';
import { GrowableEditButton } from './GrowableEditButton';
import { GrowableDeleteButton } from './GrowableDeleteButton';

const Container = styled.div`
    padding-left: 2em;
    display: flex;
`;

const ContentContainer = styled.div`
    h3 {
        color: ${({ theme }) => theme.active};
    }
    p {
        color: #727f81;
    }
`;

const ControlsContainer = styled.div`
    margin: auto 0 auto auto;
    span {
        margin: 0.25em;
        color: #bdbdbd;
    }
`;

export const GrowableHeader: React.FC = () => {
    const { title, notes } = useSelectedGrowable();

    return (
        <Container>
            <ContentContainer>
                <h3>{title}</h3>
                {notes && <p>{notes}</p>}
            </ContentContainer>
            <ControlsContainer>
                <GrowableEditButton />
                <GrowableDeleteButton />
            </ControlsContainer>
        </Container>
    );
};
