import React, { useCallback } from 'react';

import { MetricType } from '../../../../../metrics';
import {
    latestSensorMeasuresSelector,
    selectedMetricTypesSelector,
} from '../selectors';
import { useDataDispatch, useDataSelector } from '../state';
import { MetricToggles } from '../../../../../atomic-ui';
import { MeasureValue } from './MeasureValue';

export const SensorMetricToggles: React.FC = () => {
    const dispatch = useDataDispatch();

    const latestMeasures = useDataSelector(latestSensorMeasuresSelector);
    const selectedTypes = useDataSelector(selectedMetricTypesSelector);

    const handleToggle = useCallback(
        (type: MetricType) => {
            dispatch({
                type: 'TOGGLE_CHART_ITEM',
                payload: {
                    type,
                },
            });
        },
        [dispatch],
    );

    return (
        <MetricToggles
            selectedTypes={selectedTypes}
            onToggle={handleToggle}
            latestMeasures={latestMeasures}
            valueComponent={MeasureValue}
        />
    );
};
