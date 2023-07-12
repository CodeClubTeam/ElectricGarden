import React from 'react';
import styled from 'styled-components/macro';

import { TrafficLightIndicator } from '../selectors/sensorStatusSelectors';
import { BatteryLevelIcon } from './icons';

const Container = styled.div`
    display: inline-flex;
    flex-direction: column;
`;

const Percent = styled.span`
    display: inline-block;
    font-size: 0.9rem;
    text-align: center;
`;

type Props = {
    percent: number;
    indicator: TrafficLightIndicator;
};

export const BatteryStatus: React.FC<Props> = ({ indicator, percent }) => {
    return (
        <Container>
            <BatteryLevelIcon indicator={indicator} />
            <Percent>{percent}%</Percent>
        </Container>
    );
};
