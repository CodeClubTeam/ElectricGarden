import * as yup from 'yup';

import { EventObservation } from '../../types';
import { EventDisplayProp, EventInputProp } from './valueProps';

export type EventObservationModel<
    TEvent extends EventObservation = EventObservation
> = {
    occurredOn: string;
    comments: string;
    value?: TEvent;
};

export const initialEventValues: EventObservationModel = {
    occurredOn: new Date().toISOString().substring(0, 10), // this is just to use browser date. with picker we can have datetime
    comments: '',
};

export type EventTypeManifest<TEvent extends EventObservation> = {
    type: TEvent['type'];
    dataSchema?: yup.ObjectSchema<any>;
    inputComponent?: React.ComponentType<EventInputProp<TEvent>>;
    displayComponent?: React.ComponentType<EventDisplayProp<TEvent>>;
    initialValue?: Partial<TEvent['data']>;
};
