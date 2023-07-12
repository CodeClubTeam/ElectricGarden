import React from 'react';
import styled from 'styled-components/macro';

import {
    sensorStatusSelector,
    sensorDetailsOrUndefinedSelector,
} from '../selectors';
import { useDataSelector } from '../state';
import { BatteryStatus } from './BatteryStatus';
import { TransmissionStatus } from './TransmissionStatus';

const Container = styled.div``;

export const SensorStatus: React.FC = () => {
    const sensorStatus = useDataSelector(sensorStatusSelector);
    const sensorDetails = useDataSelector(sensorDetailsOrUndefinedSelector);
    if (!sensorStatus) {
        return <TransmissionStatus indicator="red" />;
    }
    const {
        batteryChargePercent,
        batteryChargeIndicator,
        lastTimestamp,
        transmissionUpdatedIndicator,
        lastRssi,
        lastSnr,
    } = sensorStatus;
    const tooltip = sensorDetails
        ? `${sensorDetails.name} (${sensorDetails.serial})`
        : undefined;
    return (
        <Container title={tooltip}>
            <BatteryStatus
                percent={batteryChargePercent}
                indicator={batteryChargeIndicator}
            />
            <TransmissionStatus
                lastReceive={lastTimestamp}
                indicator={transmissionUpdatedIndicator}
                rssi={lastRssi}
                snr={lastSnr}
            />
        </Container>
    );
};
