import { createSelector } from "reselect";

import { Metric } from "../../shared";
import { lastSampleOrUndefinedSelector, metricsInDataSelector } from "./shared";

export type Measure = {
  metric: Metric;
  value: number | null;
};

export const latestSensorMeasuresSelector = createSelector(
  lastSampleOrUndefinedSelector,
  metricsInDataSelector,
  (lastSample, metrics): Measure[] =>
    metrics.map((metric) => ({
      metric,
      value: lastSample ? lastSample[metric.reading] ?? null : null,
    })),
);
