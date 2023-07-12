import { FormikConfig } from 'formik';
import React from 'react';
import * as yup from 'yup';

import { ModalFormCreate, ModalProps } from '../../../../atomic-ui';
import { GrowableForm } from './GrowableForm';

export interface GrowableFormValues {
    title: string;
    sensorId: string;
    typeId: string;
    notes: string;
    soilType: string;
}

const updateValidationSchema = yup.object().shape({
    title: yup.string().required('Please enter a title.'),
    sensorId: yup.string().required('Please select the closest sensor.'),
    notes: yup.string(),
    soilType: yup.string(),
});

const createValidationSchema = yup
    .object()
    .concat(updateValidationSchema)
    .shape({
        typeId: yup
            .string()
            .required('Please select a type. Choose Other if not listed.'),
    });

export interface GrowableModalFormProps extends ModalProps {
    title: string;
    initialValues: GrowableFormValues;
    onSubmit: FormikConfig<GrowableFormValues>['onSubmit'];
    isUpdate?: boolean;
}

export const GrowableModalForm: React.FC<GrowableModalFormProps> = ({
    show,
    onClose,
    title,
    initialValues,
    onSubmit,
    isUpdate,
}) => {
    const GrowableModalForm = ModalFormCreate<GrowableFormValues>(title);

    return (
        <GrowableModalForm
            modalConfig={{ show, onClose }}
            formikConfig={{
                initialValues,
                validationSchema: isUpdate
                    ? updateValidationSchema
                    : createValidationSchema,
                onSubmit,
                render: (form) => (
                    <GrowableForm isUpdate={isUpdate} form={form} />
                ),
            }}
        />
    );
};
