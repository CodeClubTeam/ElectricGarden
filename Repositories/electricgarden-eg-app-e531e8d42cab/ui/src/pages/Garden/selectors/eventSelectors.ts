import { orderBy } from 'lodash-es';
import { createSelector } from 'reselect';

import { EventObservation } from './../types/ObservationValue';
import { observationsOfTypesSelectorCreate } from './observationSelectors';

export const eventTitleByType: Record<EventObservation['type'], string> = {
    planted: 'Planted',
    germinated: 'Germinated',
    fertilised: 'Fertilised',
    harvested: 'Harvested',
    sprayed: 'Sprayed',
    watered: 'Watered',
    weeded: 'Weeded',
    pruned: 'Pruned',
    photographed: 'Photographed',
};

export const eventTypes: Array<EventObservation['type']> = [
    'planted',
    'germinated',
    'weeded',
    'watered',
    'fertilised',
    'sprayed',
    'harvested',
    'photographed',
    'pruned',
];

export const eventObservationsSelectorCreate = (growableId: string) =>
    createSelector(
        observationsOfTypesSelectorCreate<EventObservation>(
            growableId,
            eventTypes,
        ),
        (events) => orderBy(events, ['occurredOn'], ['desc']),
    );

type EventType = {
    type: EventObservation['type'];
    title: string;
};

export const getEventTypeTitle = (type: EventObservation['type']): string =>
    eventTitleByType[type] || `(${type})`;

export const eventTypesSelector = () =>
    eventTypes.map(
        (type): EventType => ({
            type,
            title: getEventTypeTitle(type),
        }),
    );

export const formAddableEventTypesSelector = createSelector(
    eventTypesSelector,
    (eventTypes) => eventTypes.filter(({ type }) => type !== 'photographed'),
);
