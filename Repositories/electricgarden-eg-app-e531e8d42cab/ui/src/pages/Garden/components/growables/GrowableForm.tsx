import { Field, FormikConfig, FormikProps } from 'formik';
import React from 'react';

import {
    BootstrapField,
    FieldValidationError,
    ModalProps,
} from '../../../../atomic-ui';
import { GrowableTypeIdSelectorField } from './GrowableTypeSelector';
import { SensorIdSelectorField } from './SensorIdSelector';

export interface GrowableFormValues {
    title: string;
    sensorId: string;
    typeId: string;
    notes: string;
    soilType: string;
}

type Props = {
    form: FormikProps<GrowableFormValues>;
    isUpdate?: boolean;
};

export interface GrowableModalFormProps extends ModalProps {
    title: string;
    initialValues: GrowableFormValues;
    onSubmit: FormikConfig<GrowableFormValues>['onSubmit'];
    isUpdate?: boolean;
}

export const GrowableForm: React.FC<Props> = ({ isUpdate, form }) => (
    <>
        <BootstrapField
            id="title"
            type="text"
            name="title"
            label="Garden Name"
            placeholder="Enter title"
            required
        />
        <FieldValidationError name="title" form={form} />

        <label htmlFor="sensorId">Device</label>
        <Field
            name="sensorId"
            id="sensorId"
            component={SensorIdSelectorField}
        />
        <FieldValidationError name="sensorId" form={form} />

        <label htmlFor="notes">Garden Description</label>
        <Field
            id="notes"
            component="textarea"
            name="notes"
            label="Garden Description"
            placeholder="(optional)"
            className="form-control"
        />
        <FieldValidationError name="notes" form={form} />

        <label htmlFor="typeId">Plant or Crop</label>
        <Field name="typeId" id="typeId">
            {(props: any) => (
                <GrowableTypeIdSelectorField {...props} disabled={isUpdate} />
            )}
        </Field>
        <FieldValidationError name="typeId" form={form} />
        {/*<BootstrapField
            id="soilType"
            type="text"
            name="soilType"
            label="Soil Type"
            placeholder="(optional)"
        />
        <FieldValidationError name="soilType" form={form} /> */}
    </>
);
