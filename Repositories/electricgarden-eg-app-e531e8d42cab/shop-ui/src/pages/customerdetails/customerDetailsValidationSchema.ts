import * as yup from 'yup';

import { Address } from '../../types';
import { CustomerDetails } from './types';

const addressValidationSchema = yup.object<Address>({
  line1: yup.string().required('Please enter a street'),
  line2: yup.string(),
  line3: yup.string(),
  city: yup.string().required('Please enter city or town name'),
  postcode: yup
    .string()
    .matches(/^[0-9]{4,4}$/, {
      message: 'Postcode must be four digits',
      excludeEmptyString: true,
    })
    .required('Please enter a postcode'),
  country: yup
    .string()
    .required()
    .oneOf(['New Zealand']),
});

export const customerDetailsValidationSchema = yup.object<CustomerDetails>({
  name: yup.string().required('Please enter your full name'),
  organisationName: yup.string().required('Please enter your school name.'),
  email: yup
    .string()
    .email()
    .required(),
  newsletterOptIn: yup.boolean(),
  useDifferentBillingEmail: yup.boolean(),
  billingEmail: yup.string().when('useDifferentBillingEmail', {
    is: true,
    then: yup
      .string()
      .email()
      .required(
        'Please enter a billing email or untick "enter a different billing email address".',
      ),
    otherwise: yup.string().notRequired(),
  }),
  shippingAddress: addressValidationSchema,
  useDifferentBillingAddress: yup.boolean(),
  billingAddress: yup.mixed().when('useDifferentBillingAddress', {
    is: true,
    then: addressValidationSchema,
  }),
});
