import { Field } from 'formik';
import React from 'react';
import { useDispatch } from 'react-redux';
import * as yup from 'yup';
import {
    FieldValidationError,
    ModalFormCreate,
    ModalProps,
} from '../../../atomic-ui';
import { useFormSubmitHandler } from '../../../hooks';
import * as actions from '../actions';
import { ensureSuSensorsFetched } from './ensureFetched';
import { SerialSelectorField } from './SerialSelector';

interface FormValues {
    targetSerial: string;
}

const SensorReplaceModalForm = ModalFormCreate<FormValues>('Replace Sensor', {
    submitButtonContent: 'Replace',
    confirm: {
        title: 'Confirm replace',
        message:
            'Remove this sensor and migrate all growables and readings to the replacement?',
    },
});

const validationSchema = yup.object().shape({
    targetSerial: yup.string().required('Select a target sensor'),
});

interface SensorReplaceProps extends ModalProps {
    sensor: ServerSensor;
}

const SensorReplaceComponent: React.FC<SensorReplaceProps> = ({
    sensor,
    show,
    onClose,
}) => {
    const dispatch = useDispatch();

    const handleSubmit = useFormSubmitHandler<FormValues>(
        ({ targetSerial }, api) =>
            api.sensor.replace(sensor.serial, targetSerial),
        {
            onSuccess: () => {
                dispatch(actions.fetchSuSensors());
                onClose();
            },
        },
    );

    return (
        <SensorReplaceModalForm
            modalConfig={{ show, onClose }}
            formikConfig={{
                initialValues: {
                    targetSerial: '',
                },
                validationSchema,
                onSubmit: handleSubmit,
                validateOnMount: true,
                render: (form) => (
                    <>
                        <p>
                            Sensor: {sensor.serial} ({sensor.name})
                        </p>

                        <label>
                            Replacement Node
                            <Field name="targetSerial" id="targetSerial">
                                {(props: any) => (
                                    <SerialSelectorField
                                        {...props}
                                        unassignedOnly
                                    />
                                )}
                            </Field>
                        </label>
                        <FieldValidationError name="targetSerial" form={form} />
                    </>
                ),
            }}
        />
    );
};

export const SensorReplace = ensureSuSensorsFetched(SensorReplaceComponent);
