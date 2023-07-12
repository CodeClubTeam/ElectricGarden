import * as yup from 'yup';

import { LEARNER_LEVEL_DEFAULT } from '../constants';

export const userValidationSchema = yup.object().shape({
    name: yup.string().required('Please enter their full name.'),
    email: yup.string().email().required('Please enter their email address.'),
    learnerLevel: yup
        .number()
        .optional()
        .default(LEARNER_LEVEL_DEFAULT)
        .positive(),
    role: yup.string().required('Please select a role for this user.'),
});
