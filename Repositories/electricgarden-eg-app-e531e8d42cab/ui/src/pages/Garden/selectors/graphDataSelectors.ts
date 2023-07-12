import { createSelector } from 'reselect';

import { ObservationData, ObservationValue } from '../types';
import { eventTypes } from './eventSelectors';
import {
    observationsForGrowableInDateRangeSelectorCreate,
    observationsForGrowableSelectorCreate,
    observationsForGrowableSelectorTimeOrderedCreate,
} from './observationSelectors';

const yPositionByType = (eventTypes as Array<ObservationData['type']>).reduce(
    (result, type, index) => {
        result[type] = index;
        return result;
    },
    {} as Record<ObservationData['type'], number>,
);

const getYPosition = ({
    value: { type },
}: ServerObservation<ObservationValue>) => 8 + yPositionByType[type] * 2 || 10;

export const observationDataSelectorCreate = (
    growableId: string,
    dateRange?: DateRange,
) =>
    createSelector(
        observationsForGrowableSelectorTimeOrderedCreate(
            dateRange
                ? observationsForGrowableInDateRangeSelectorCreate(
                      observationsForGrowableSelectorCreate(growableId),
                      dateRange,
                  )
                : observationsForGrowableSelectorCreate(growableId),
        ),
        (items): ObservationData[] =>
            items.map((item) => ({
                timestamp: item.occurredOn,
                type: item.value.type,
                id: item.id,
                value: getYPosition(item),
            })),
    );
