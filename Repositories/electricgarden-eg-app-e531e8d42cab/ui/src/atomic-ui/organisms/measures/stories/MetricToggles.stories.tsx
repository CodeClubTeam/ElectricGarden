import { action } from '@storybook/addon-actions';
import React from 'react';

import { sensorMetricsSelector } from '../../../../metrics';
import { MetricToggles } from '../MetricToggles';
import { Measure } from '../types';
import { MeasureValue } from '../../../../pages/Garden/components/datagraph/measures/MeasureValue';

const metrics = sensorMetricsSelector();

const ValueComponent = MeasureValue;

export const empty = () => (
    <MetricToggles
        latestMeasures={[]}
        selectedTypes={['airTemp']}
        onToggle={action('toggled')}
        valueComponent={ValueComponent}
    />
);

export const withValue = () => {
    const latestMeasures: Measure[] = metrics
        .filter(({ type }) => type === 'airTemp')
        .map((metric) => ({
            metric,
            value: 12.5,
        }));
    return (
        <MetricToggles
            latestMeasures={latestMeasures}
            selectedTypes={['airTemp']}
            onToggle={action('toggled')}
            valueComponent={ValueComponent}
        />
    );
};

export const withNoValue = () => {
    const latestMeasures: Measure[] = metrics
        .filter(({ type }) => type === 'airTemp')
        .map((metric) => ({
            metric,
            value: null,
        }));
    return (
        <MetricToggles
            latestMeasures={latestMeasures}
            selectedTypes={['airTemp']}
            onToggle={action('toggled')}
            valueComponent={ValueComponent}
        />
    );
};

export default {
    component: MetricToggles,
    title: 'MetricToggles',
};
