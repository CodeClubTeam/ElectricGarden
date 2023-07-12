import { orderBy } from 'lodash-es';
import { createSelector } from 'reselect';

import {
    currentOrganisationStateSelector,
    AppSelector,
} from '../../../selectors';
import {
    ObservationsState,
    ObservationValue,
    PhotographedEvent,
} from '../types';
import moment from 'moment';

const observationsStateSelector = createSelector(
    currentOrganisationStateSelector,
    (state) => state.garden.observations,
);

const observationsForGrowableStateSelectorCreate = (growableId: string) =>
    createSelector(
        observationsStateSelector,
        (byId): ObservationsState =>
            byId[growableId] || {
                fetched: false,
                fetching: false,
                observations: [],
            },
    );

export const observationsForGrowableFetchStateSelectorCreate = (
    growableId: string,
) =>
    createSelector(
        observationsForGrowableStateSelectorCreate(growableId),
        ({ fetched, fetching }) => ({
            fetched: !!fetched,
            fetching: !!fetching,
        }),
    );

export const observationsForGrowableSelectorCreate = (growableId: string) =>
    createSelector(
        observationsForGrowableStateSelectorCreate(growableId),
        ({ observations }) => observations,
    );

type ObservationsSelector = AppSelector<ServerObservation[]>;

export const observationsForGrowableInDateRangeSelectorCreate = (
    observationsSelector: ObservationsSelector,
    { startDate, endDate }: DateRange,
) =>
    createSelector(observationsSelector, (observations) =>
        observations.filter(({ occurredOn }) =>
            moment(occurredOn).isBetween(startDate, endDate),
        ),
    );

export const observationsForGrowableSelectorTimeOrderedCreate = (
    observationsSelector: ObservationsSelector,
) =>
    createSelector(observationsSelector, (observations) =>
        orderBy(observations, ['occurredOn']),
    );

export const observationsOfTypesSelectorCreate = <
    TValue extends ObservationValue
>(
    growableId: string,
    types: Array<TValue['type']>,
) =>
    createSelector(
        observationsForGrowableSelectorCreate(growableId),
        (observations) =>
            observations.filter((observation): observation is ServerObservation<
                TValue
            > => types.includes(observation.value.type)),
    );

export const observationsOfTypeSelectorCreate = <
    TValue extends ObservationValue
>(
    growableId: string,
    type: TValue['type'],
) =>
    createSelector(
        observationsForGrowableSelectorCreate(growableId),
        (observations) =>
            observations.filter(
                (observation): observation is ServerObservation<TValue> =>
                    observation.value.type === type,
            ),
    );

export const orderedPhotoObservationsSelectorCreate = (growableId: string) =>
    createSelector(
        observationsOfTypeSelectorCreate<PhotographedEvent>(
            growableId,
            'photographed',
        ),
        (observations) => orderBy(observations, ['recordedOn']),
    );
