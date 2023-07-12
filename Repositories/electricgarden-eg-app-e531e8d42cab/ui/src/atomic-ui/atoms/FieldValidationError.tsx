import React from 'react';
import { FormikProps, FormikValues } from 'formik';
import styled from 'styled-components/macro';

type Props<FormValues extends FormikValues> = {
    name: keyof FormValues & string;
    form: Pick<FormikProps<FormValues>, 'touched' | 'errors'>;
};

const ValidationError = styled.p`
    color: red;
`;

export const FieldValidationError = <TProps extends Props<any>>({
    name,
    form: { touched, errors },
}: TProps) => {
    if (!touched[name] && errors[name]) {
        return null;
    }
    return <ValidationError>{errors[name]}</ValidationError>;
};
