import { createSelector } from 'reselect';
import {
    ManualMetric,
    manualMetricsByType,
    Metric,
    MetricType,
    SensorMetric,
    sensorMetricsByType,
} from './definitions';
import { getMetricIcon } from './icons';

const transformMetricsCreate = <T extends Metric>(
    definitionsByType: Record<MetricType, any>,
    filter: (pair: [MetricType, Metric]) => boolean = () => true,
): T[] =>
    Object.entries(definitionsByType)
        .filter(filter)
        .map(([type, value]) => ({
            type,
            icon: getMetricIcon(type),
            ...value,
        }));

export const sensorMetricsSelector = () =>
    transformMetricsCreate<SensorMetric>(sensorMetricsByType);

export const manualMetricsSelector = () =>
    transformMetricsCreate<ManualMetric>(manualMetricsByType);

export const sensorMetricsExcludingAdminSelector = createSelector(
    sensorMetricsSelector,
    (metrics) => metrics.filter((metric) => !metric.admin),
);
