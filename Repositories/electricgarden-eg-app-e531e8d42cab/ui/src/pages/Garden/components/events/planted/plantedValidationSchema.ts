import * as yup from 'yup';
import { PlantedEvent } from '../../../types';

const methods: Array<PlantedEvent['data']['method']> = ['seed', 'seedling'];

export const plantedValidationSchema = yup.object().shape({
    method: yup
        .string()
        .oneOf(methods)
        .required('Please select the method of planting.'),
});
