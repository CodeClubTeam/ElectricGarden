import { HarvestedEvent } from '../../../types';
import { EventTypeManifest } from '../model';
import { harvestedValidationSchema } from './harvestedValidationSchema';
import { HarvestedEventDisplay } from './HarvestedEventDisplay';
import { HarvestedEventInput } from './HarvestedEventInput';

export const harvestedManifest: EventTypeManifest<HarvestedEvent> = {
    type: 'harvested',
    dataSchema: harvestedValidationSchema,
    displayComponent: HarvestedEventDisplay,
    inputComponent: HarvestedEventInput,
    initialValue: {
        amount: 0,
        type: 'count',
    },
};
