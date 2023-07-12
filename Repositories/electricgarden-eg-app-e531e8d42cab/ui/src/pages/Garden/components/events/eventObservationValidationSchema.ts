import * as yup from 'yup';

import { eventTypes } from '../../selectors';
import { manifests } from './manifests';
import moment from 'moment';

const byTypeWhens = manifests
    .filter((m) => !!m.dataSchema)
    .reduce(
        (result, { type, dataSchema }) =>
            result.when('type', {
                is: type,
                then: dataSchema,
            }),
        yup.object(),
    );

const EG_EPOC = moment('2018-01-01').toDate();

export const eventObservationValidationSchema = yup.object({
    occurredOn: yup
        .date()
        .max(new Date(), 'This date is in the future.')
        .min(EG_EPOC, 'This date is too long ago.') // TODO: this could be the growable create date instead
        .required('Please tell us when this happened.'),
    value: yup
        .object()
        .shape({
            type: yup
                .string()
                .oneOf(eventTypes)
                .required(),
            data: byTypeWhens,
        })
        .required('Please select the type of event.'),
});
