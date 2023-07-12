import { last } from 'lodash-es';
import { createSelector } from 'reselect';

import { PointDataState } from '../state';

const pointDataStateSelector = (pointData: PointDataState) => pointData;

export const pointDataSelector = createSelector(
    pointDataStateSelector,
    (state) => state.data,
);

export const lastPointOrUndefinedSelector = createSelector(
    pointDataSelector,
    ({ points }): DataPoint | undefined => last(points),
);

export const sensorDetailsOrUndefinedSelector = createSelector(
    pointDataSelector,
    ({ sensor }) => sensor,
);

export const chartItemsSelector = createSelector(
    pointDataStateSelector,
    ({ chartItems }) => chartItems,
);
