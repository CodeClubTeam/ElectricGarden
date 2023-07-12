import moment from 'moment';
import React from 'react';
import styled from 'styled-components/macro';

import { TrafficLightIndicator } from '../selectors/sensorStatusSelectors';
import { SignalIcon } from './icons';

const Container = styled.div`
    display: inline-flex;
    flex-direction: column;
    padding-left: 10px;
    svg {
        margin-left: 5px;
    }
`;

const LastReceive = styled.span`
    display: inline-block;
    font-size: 0.9rem;
    text-align: center;
    white-space: nowrap;
`;

type Props = {
    indicator: TrafficLightIndicator;
    lastReceive?: Date;
    rssi?: number;
    snr?: number;
};

export const TransmissionStatus: React.FC<Props> = ({
    indicator,
    lastReceive,
    snr,
    rssi,
}) => {
    return (
        <Container>
            <SignalIcon indicator={indicator} />
            <LastReceive title={`SNR: ${snr}. RSSI: ${rssi}`}>
                {lastReceive && moment(lastReceive).fromNow(true)}
                {!lastReceive && 'No data'}
            </LastReceive>
        </Container>
    );
};
