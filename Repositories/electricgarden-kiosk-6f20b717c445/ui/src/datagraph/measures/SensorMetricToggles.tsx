import React, { useCallback } from "react";

import {
  latestSensorMeasuresSelector,
  selectedMetricTypesSelector,
} from "../selectors";
import { useDataDispatch, useDataSelector } from "../state";
import { MetricToggles } from "./MetricToggles";
import { MetricType } from "../../shared";

export const SensorMetricToggles = () => {
  const dispatch = useDataDispatch();

  const latestMeasures = useDataSelector(latestSensorMeasuresSelector);
  const selectedTypes = useDataSelector(selectedMetricTypesSelector);

  const handleToggle = useCallback(
    (type: MetricType) => {
      dispatch({
        type: "TOGGLE_CHART_ITEM",
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
    />
  );
};
