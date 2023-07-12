import React from 'react';

import { CannedChart as Chart } from '../CannedChart';

import stormData from './storm-data.json';

const emptyData = {
    points: [],
};

export const loading = () => {
    return <Chart fetching={true} data={emptyData} />;
};

export const noData = () => {
    return <Chart data={emptyData} />;
};

export const singleDataPoint = () => {
    const singleDataPoint = {
        points: stormData.points.slice(0, 1),
    };
    return <Chart data={singleDataPoint} />;
};

export const partDay = () => {
    return <Chart data={stormData} />;
};

const gapIndexes = [3, 4];

export const gapsInReadings = () => {
    const gapData = {
        points: stormData.points.map(({ timestamp, readings }, index) => ({
            timestamp,
            readings: {
                ...readings,
                probe_air_temp: gapIndexes.includes(index)
                    ? undefined
                    : readings.probe_air_temp,
            },
        })),
    };
    return <Chart data={gapData} />;
};

export default {
    component: Chart,
    title: 'Chart',
};
