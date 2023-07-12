import { values } from 'lodash';
import { createSelector } from 'reselect';

import {
    anyRequestsActiveSelectorCreator,
    currentOrganisationStateSelector,
} from '../../../selectors';
import * as actions from '../actions';

const sensorsStateSelector = createSelector(
    currentOrganisationStateSelector,
    ({ sensors }) => sensors,
);

export const sensorsByIdSelector = createSelector(
    sensorsStateSelector,
    (sensorsById) => sensorsById,
);

export const sensorsSelector = createSelector(
    sensorsByIdSelector,
    (lookup) => values(lookup),
);

export const sensorsFetchingSelector = anyRequestsActiveSelectorCreator(
    actions.fetchSensors,
);

export const sensorOptionsSelector = createSelector(
    sensorsSelector,
    (sensors) =>
        sensors.map(({ serial, name }) => ({
            value: serial,
            label: `${name} (${serial})`,
        })),
);
