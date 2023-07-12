import * as yup from 'yup';
import { HarvestedEvent } from '../../../types';

const measureTypes: Array<HarvestedEvent['data']['type']> = [
    'count',
    'volume',
    'weight',
];

export const harvestedValidationSchema = yup.object().shape({
    amount: yup
        .number()
        .min(1)
        .required('Please enter the number or weight of harvest.'),
    type: yup
        .string()
        .oneOf(measureTypes)
        .required('Please choose a unit of measure.'),
});
