import { FieldProps } from 'formik';

import { EventObservation } from '../../types';
import { EventObservationModel } from './model';

type PartialData<TEvent extends EventObservation> = Partial<TEvent['data']>;

export type EventInputProp<TEvent extends EventObservation> = {
    value?: PartialData<TEvent>;
    onChange: (value?: PartialData<TEvent>) => void;
} & FieldProps<EventObservationModel>;

export type EventDisplayProp<TEvent extends EventObservation> = {
    value: TEvent;
};
