import { sortBy } from 'lodash-es';
import { createSelector } from 'reselect';

import { currentOrganisationStateSelector } from '../../../selectors';
import { createServerDataStateSelectors } from '../../../utils';

const sensorsStateSelector = createSelector(
    currentOrganisationStateSelector,
    ({ sensors }) => sensors,
);

const selectors = createServerDataStateSelectors(sensorsStateSelector);

export const sensorsFetchStateSelector = selectors.fetchStateSelector;

export const sensorsSelector = selectors.items;

export const sensorsByIdSelector = selectors.itemsByKey;

export const sensorOptionsSelector = createSelector(
    sensorsSelector,
    (sensors) =>
        sensors.map(({ serial, name }) => ({
            value: serial,
            label: `${name} (${serial})`,
        })),
);

export const sensorsSummarySelector = createSelector(
    sensorsSelector,
    (sensors) => sortBy(sensors, 'name'),
);

export const sensorSummarySelectorCreate = (serial: string) =>
    createSelector(sensorsSummarySelector, (sensors) =>
        sensors.find((s) => s.serial === serial),
    );

// TODO: temp hard code; move as info into device hq
const LIVE_MODE_SERIALS = ['3HLL8FL', '3HLL8FW'];

export const sensorsWithLiveModeSelector = createSelector(
    sensorsSelector,
    (sensors) => sensors.filter((s) => LIVE_MODE_SERIALS.includes(s.serial)),
);
