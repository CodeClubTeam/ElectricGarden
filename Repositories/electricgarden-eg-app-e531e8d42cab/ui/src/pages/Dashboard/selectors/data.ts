import { createSelector } from 'reselect';

import {
    AppSelector,
    currentOrganisationStateSelector,
} from '../../../selectors';
import { SensorSerialFetchable } from '../reducers';

const dataStateSelector = createSelector(
    currentOrganisationStateSelector,
    ({ data }) => data,
);

export type SensorSerialSelector = AppSelector<string | undefined>;

export const sensorSerialStateSelectorCreate = (
    sensorSerialSelector: SensorSerialSelector,
) =>
    createSelector(
        sensorSerialSelector,
        dataStateSelector,
        (sensorSerial, state): SensorSerialFetchable =>
            sensorSerial && state[sensorSerial]
                ? state[sensorSerial]
                : { data: [] },
    );

export const dataSelectorCreate = (
    sensorSerialSelector: SensorSerialSelector,
) =>
    createSelector(
        sensorSerialStateSelectorCreate(sensorSerialSelector),
        (state) => state.data,
    );

export const dataFetchStateSelectorCreate = (
    sensorSerialSelector: SensorSerialSelector,
) =>
    createSelector(
        sensorSerialStateSelectorCreate(sensorSerialSelector),
        ({ fetching, fetched }) => ({ fetching, fetched }),
    );
