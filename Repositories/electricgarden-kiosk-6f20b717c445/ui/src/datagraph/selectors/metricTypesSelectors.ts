import { createSelector } from "reselect";
import { VisibleMetricTypes } from "../../shared";
import { chartItemsSelector } from "./shared";

export const selectedMetricTypesSelector = createSelector(
  chartItemsSelector,
  (visibleMetricTypes) =>
    Object.entries(visibleMetricTypes)
      .filter(([, selected]) => !!selected)
      .map(([type]) => type as keyof VisibleMetricTypes),
);
