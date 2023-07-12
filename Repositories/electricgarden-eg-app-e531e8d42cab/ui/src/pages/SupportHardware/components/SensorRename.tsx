import React from 'react';
import { useDispatch } from 'react-redux';
import * as yup from 'yup';

import {
    ModalFormCreate,
    ModalProps,
    BootstrapField,
} from '../../../atomic-ui';
import { useFormSubmitHandler } from '../../../hooks';
import * as actions from '../actions';

interface FormValues {
    name: string;
    organisationId: string;
    purgeReadings: boolean;
}

const SensorAssignModalForm = ModalFormCreate<FormValues>('Assign Sensor', {
    submitButtonContent: 'Assign',
    confirm: {
        title: 'Confirm purge',
        message: 'Delete all data points for this sensor?',
        skipIf: (values) => !values.purgeReadings,
    },
});

const validationSchema = yup.object().shape({
    name: yup.string().notRequired(),
    organisationId: yup.string().notRequired(),
    purgeReadings: yup.boolean().required(),
});

interface SensorRenameProps extends ModalProps {
    sensor: ServerSensor;
}

export const SensorRename: React.FC<SensorRenameProps> = ({
    sensor,
    show,
    onClose,
}) => {
    const dispatch = useDispatch();

    const handleSubmit = useFormSubmitHandler<FormValues>(
        ({ name, organisationId, purgeReadings }, api) =>
            api.sensor.assign(sensor.serial, {
                name,
                organisationId,
                purgeReadings,
            }),
        {
            onSuccess: () => {
                // note that non-su hardware table may be out of date but I don't think SU's will be using that
                // screen and also I think we'll be moving the SU stuff out altogether
                dispatch(actions.fetchSuSensors());
                onClose();
            },
        },
    );

    return (
        <SensorAssignModalForm
            modalConfig={{ show, onClose }}
            formikConfig={{
                initialValues: {
                    organisationId: sensor.organisationId ?? '',
                    name: sensor.name ?? '',
                    purgeReadings: false,
                },
                validationSchema,
                onSubmit: handleSubmit,
                validateOnMount: true,
                render: (form) => (
                    <>
                        <p>Serial: {sensor.serial}</p>
                        <BootstrapField type="text" name="name" label="Name:" />
                    </>
                ),
            }}
        />
    );
};
