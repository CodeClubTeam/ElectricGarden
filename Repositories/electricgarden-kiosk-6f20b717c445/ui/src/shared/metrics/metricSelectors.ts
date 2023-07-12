import {
  getMetricIcon,
  Metric,
  MetricType,
  sensorMetricsByType,
} from "../../shared";

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

export const metricsSelector = () =>
  transformMetricsCreate(sensorMetricsByType);
