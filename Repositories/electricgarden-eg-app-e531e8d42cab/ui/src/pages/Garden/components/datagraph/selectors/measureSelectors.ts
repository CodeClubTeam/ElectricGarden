import { createSelector } from 'reselect';

import { sensorMetricsExcludingAdminSelector } from '../../../../../metrics';
import { lastPointOrUndefinedSelector } from './shared';
import { Measure } from '../../../../../atomic-ui';

export const latestSensorMeasuresSelector = createSelector(
    lastPointOrUndefinedSelector,
    sensorMetricsExcludingAdminSelector,
    (lastPoint, metrics): Measure[] =>
        metrics.map((metric) => ({
            metric,
            value: lastPoint ? lastPoint[metric.reading] : null,
        })),
);
