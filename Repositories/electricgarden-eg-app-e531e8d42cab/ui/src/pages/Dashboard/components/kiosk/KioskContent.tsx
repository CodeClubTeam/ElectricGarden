import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components/macro';

import {
    ensureSensorsFetched,
    sensorsWithLiveModeSelector,
} from '../../../Hardware';
import { KioskData } from './KioskData';

const Container = styled.div`
    background-color: ${({ theme }) => theme.cover.bg};
`;

export const KioskContent = ensureSensorsFetched(() => {
    const liveSensors = useSelector(sensorsWithLiveModeSelector);
    if (liveSensors.length === 0) {
        return <p>No live mode sensors found.</p>;
    }
    const serial = liveSensors[0].serial;

    return (
        <Container>
            <KioskData serial={serial} />
        </Container>
    );
});
