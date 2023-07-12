import React from 'react';
import { useDispatch } from 'react-redux';

import { useFormSubmitHandler } from '../../../../hooks';
import * as actions from '../../actions';
import {
    GrowableFormValues,
    GrowableModalForm,
    GrowableModalFormProps,
} from './GrowableModalForm';

interface Props extends Pick<GrowableModalFormProps, 'show' | 'onClose'> {
    growable: ServerGrowable;
}

export const GrowableEdit: React.FC<Props> = ({ show, onClose, growable }) => {
    const dispatch = useDispatch();

    const initialValues: GrowableFormValues = {
        typeId: growable.type.id,
        title: growable.title,
        sensorId: growable.sensorId,
        notes: growable.notes || '',
        soilType: growable.soilType || '',
    };

    const handleSubmit = useFormSubmitHandler<
        GrowableFormValues,
        ServerGrowable
    >(
        ({ title, sensorId, notes, soilType }, api) => {
            return api.growables.update(growable.id, {
                title,
                sensorId,
                notes,
                soilType,
            });
        },
        {
            onSuccess: (savedGrowable) => {
                dispatch(actions.updatedOrCreatedGrowable(savedGrowable));
                onClose();
                window.location.reload();
            },
        },
    );

    return (
        <GrowableModalForm
            show={show}
            onClose={onClose}
            title="Edit Plant/Crop"
            initialValues={initialValues}
            onSubmit={handleSubmit}
            isUpdate={true}
        />
    );
};
