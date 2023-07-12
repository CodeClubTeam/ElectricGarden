import moment from 'moment';
import { createSelector } from 'reselect';

import { lastPointOrUndefinedSelector } from './shared';

export type TrafficLightIndicator = 'red' | 'orange' | 'green';

export interface SensorStatus {
    batteryChargePercent: number;
    batteryChargeIndicator: TrafficLightIndicator;
    lastTimestamp: Date;
    transmissionUpdatedIndicator: TrafficLightIndicator;
    lastSnr?: number;
    lastRssi?: number;
}

type BatteryIndicatorStop = {
    percent: number;
    indicator: TrafficLightIndicator;
};

// descending order
const batteryIndicatorStops: BatteryIndicatorStop[] = [
    {
        percent: 70,
        indicator: 'green',
    },
    {
        percent: 30,
        indicator: 'orange',
    },
];

const getBatteryIndicator = (chargePercent: number): TrafficLightIndicator => {
    const stop = batteryIndicatorStops.find(
        ({ percent }) => chargePercent >= percent,
    );
    if (!stop) {
        return 'red';
    }
    return stop.indicator;
};

type LastTransmissionIndicatorStop = {
    hoursAgo: number;
    indicator: TrafficLightIndicator;
};

// descending order
const lastTransmissionStops: LastTransmissionIndicatorStop[] = [
    {
        hoursAgo: 1,
        indicator: 'green',
    },
    {
        hoursAgo: 3,
        indicator: 'orange',
    },
];

const getTransmissionUpdatedIndicator = ({ timestamp }: DataPoint) => {
    const hoursAgo = moment().diff(timestamp, 'hours');
    const stop = lastTransmissionStops.find((s) => hoursAgo <= s.hoursAgo);
    if (!stop) {
        return 'red';
    }
    return stop.indicator;
};

export const sensorStatusSelector = createSelector(
    lastPointOrUndefinedSelector,
    (lastPoint): SensorStatus | undefined => {
        if (!lastPoint) {
            return undefined;
        }

        const { timestamp, snr, rssi, batteryPercent } = lastPoint;
        const batteryChargePercent = batteryPercent ?? 0;
        return {
            batteryChargePercent,
            batteryChargeIndicator: getBatteryIndicator(batteryChargePercent),
            lastTimestamp: timestamp,
            transmissionUpdatedIndicator: getTransmissionUpdatedIndicator(
                lastPoint,
            ),
            lastSnr: snr ?? undefined,
            lastRssi: rssi ?? undefined,
        };
    },
);
