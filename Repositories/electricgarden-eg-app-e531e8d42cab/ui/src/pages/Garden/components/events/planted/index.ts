import { PlantedEvent } from '../../../types';
import { EventTypeManifest } from '../model';
import { plantedValidationSchema } from './plantedValidationSchema';
import { PlantedEventInput } from './PlantedEventInput';
import { PlantedEventDisplay } from './PlantedEventDisplay';

export const plantedManifest: EventTypeManifest<PlantedEvent> = {
    type: 'planted',
    dataSchema: plantedValidationSchema,
    displayComponent: PlantedEventDisplay,
    inputComponent: PlantedEventInput,
    initialValue: {},
};
