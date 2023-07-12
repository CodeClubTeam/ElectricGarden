import { createSelector } from 'reselect';

import { currentOrganisationStateSelector } from '../../../selectors';

const viewStateSelector = createSelector(
    currentOrganisationStateSelector,
    ({ view }) => view,
);

export const chartViewSelector = createSelector(
    viewStateSelector,
    ({ chartView }) => chartView,
);

export const selectedSensorSerialSelector = createSelector(
    chartViewSelector,
    ({ currentSensor }) => currentSensor && currentSensor.serial,
);
