import * as yup from 'yup';

export const orgValidationSchema = yup.object().shape({
    name: yup.string().required('Please enter a name for the organisation.'),
    line1: yup.string().required('Please enter a street address.'),
    line2: yup.string().default(''),
    line3: yup.string().default(''),
    city: yup.string().required('Please enter a city.'),
    country: yup.string().oneOf(['New Zealand']),
    postcode: yup
        .string()
        .required()
        .matches(/^[0-9]{4,4}$/, {
            message: 'Postcode must be four digits.',
            excludeEmptyString: true,
        }),
});
