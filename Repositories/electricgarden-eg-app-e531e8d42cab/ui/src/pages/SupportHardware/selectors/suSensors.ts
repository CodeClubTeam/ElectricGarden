import { sortBy } from 'lodash-es';
import { createSelector } from 'reselect';

import { createServerDataStateSelectors } from '../../../utils';
import { AppState } from '../../../types';
import moment from 'moment';

const suSensorsStateSelector = (state: AppState) => state.suSensors;

const selectors = createServerDataStateSelectors(suSensorsStateSelector);

export const suSensorsFetchStateSelector = selectors.fetchStateSelector;

export const suSensorsSelector = selectors.items;

export const suSensorsByIdSelector = selectors.itemsByKey;

export const suSensorsBySerialSelector = createSelector(
    suSensorsSelector,
    (sensors) => sortBy(sensors, 'serial'),
);

export const unassignedSuSensorsSelector = createSelector(
    suSensorsBySerialSelector,
    (sensors) => sensors.filter((s) => !s.organisationId),
);

const calcReadingsPerDayAverage = (
    readingsStats?: SuperUserSensor['readingStats'],
) => {
    if (!readingsStats || readingsStats.count === 0) {
        return 0;
    }
    const { first, last, count } = readingsStats;
    const days = moment(last).diff(moment(first), 'days');
    if (days === 0) {
        return 0;
    }
    return Math.round(count / days);
};

export const suSensorsWithStatsSelector = createSelector(
    suSensorsSelector,
    (sensors) =>
        sensors.map(({ readingStats, ...sensor }) => ({
            ...sensor,
            firstReading: readingStats?.first,
            lastReading: readingStats?.last,
            readingsCount: readingStats?.count,
            readingAveragePerDay: calcReadingsPerDayAverage(readingStats),
        })),
);
