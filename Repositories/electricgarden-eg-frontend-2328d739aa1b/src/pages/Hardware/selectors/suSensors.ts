import { sortBy, values } from 'lodash';
import { createSelector } from 'reselect';

import { currentOrganisationStateSelector } from '../../../selectors';

const suSensorsStateSelector = createSelector(
    currentOrganisationStateSelector,
    ({ suSensors }) => suSensors,
);

export const suSensorsByIdSelector = createSelector(
    suSensorsStateSelector,
    (suSensorsById) => suSensorsById,
);

export const suSensorsSelector = createSelector(
    suSensorsByIdSelector,
    (lookup) => values(lookup),
);

export const suSensorsBySerialSelector = createSelector(
    suSensorsSelector,
    (sensors) => sortBy(sensors, (sensor) => sensor.serial),
);
