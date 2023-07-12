import { last } from "lodash-es";
import { createSelector } from "reselect";

import { PointDataState } from "../state";
import { metricsSelector, MetricType, Sample } from "../../shared";
import { metricTypesInSamples } from "../transforms";

const pointDataStateSelector = (pointData: PointDataState) => pointData;

export const sampleDataSelector = createSelector(
  pointDataStateSelector,
  (state) => state.data,
);

export const lastSampleOrUndefinedSelector = createSelector(
  sampleDataSelector,
  ({ samples }): Sample | undefined => last(samples),
);

export const sensorDetailsOrUndefinedSelector = createSelector(
  sampleDataSelector,
  ({ sensor }) => sensor,
);

export const chartItemsSelector = createSelector(
  pointDataStateSelector,
  ({ chartItems }) => chartItems,
);

const metricPropertiesInDataSelector = createSelector(
  sampleDataSelector,
  ({ samples }): MetricType[] => metricTypesInSamples(samples),
);

export const metricsInDataSelector = createSelector(
  metricPropertiesInDataSelector,
  metricsSelector,
  (types, metrics) => metrics.filter((m) => types.includes(m.reading)),
);
