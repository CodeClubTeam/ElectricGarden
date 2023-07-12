import { createSelector } from 'reselect';

import { AppState } from '../../../types';

const viewStateSelector = (state: AppState) => state.view;

export const chartViewSelector = createSelector(
    viewStateSelector,
    ({ chartView }) => chartView,
);
