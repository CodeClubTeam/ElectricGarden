import * as yup from 'yup';

import { PaymentDetails } from './types';
import { PaymentMethod } from '../../types';

export const paymentValidationSchema = yup.object<PaymentDetails>({
  method: yup
    .mixed<PaymentMethod>()
    .oneOf(['po', 'cc'])
    .required(),
  acceptTerms: yup
    .boolean()
    .required()
    .oneOf([true], 'You must accept the terms before you can subscribe.'),
  purchaseOrderNumber: yup.string().when('method', {
    is: 'po',
    then: yup.string().required('Please enter a purchase order number'),
  }),
});
