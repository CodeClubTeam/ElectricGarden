import { EventObservation } from '../../types';
import { EventTypeManifest } from './model';
import { plantedManifest } from './planted';
import { harvestedManifest } from './harvested';

const createDatalessManifests = (
    ...types: Array<EventObservation['type']>
): Array<EventTypeManifest<EventObservation>> =>
    types.map((type) => ({
        type,
    }));

// TODO: should be possible now to ensure all events types are represented through types
export const manifests: EventTypeManifest<any>[] = [
    plantedManifest,
    harvestedManifest,
    ...createDatalessManifests(
        'germinated',
        'watered',
        'weeded',
        'sprayed',
        'fertilised',
        'photographed',
        'pruned',
    ),
];

export const getManifest = <TEvent extends EventObservation>(
    type: TEvent['type'],
) => manifests.find((m) => m.type === type);

export const getInitialValue = <TEvent extends EventObservation>(
    type: TEvent['type'],
) => {
    const manifest = getManifest(type);
    if (manifest && manifest.initialValue) {
        return manifest.initialValue;
    }
    return {};
};
