import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useFormSubmitHandler } from '../../../../hooks';
import * as actions from '../../actions';
import { selectedTeamSelector } from '../../selectors';
import {
    GrowableFormValues,
    GrowableModalForm,
    GrowableModalFormProps,
} from './GrowableModalForm';

const initialValues: GrowableFormValues = {
    typeId: '',
    title: '',
    sensorId: '',
    notes: '',
    soilType: '',
};

interface Props extends Pick<GrowableModalFormProps, 'show' | 'onClose'> {}

export const GrowableAdd: React.FC<Props> = ({ show, onClose }) => {
    const team = useSelector(selectedTeamSelector);

    const dispatch = useDispatch();

    const handleSubmit = useFormSubmitHandler<
        GrowableFormValues,
        ServerGrowable
    >(
        ({ title, sensorId, typeId, notes, soilType }, api) => {
            return api.growables.create({
                typeId,
                title,
                teamId: team.id,
                sensorId,
                notes,
                soilType,
            });
        },
        {
            onSuccess: (savedGrowable) => {
                dispatch(actions.updatedOrCreatedGrowable(savedGrowable));
                onClose();
            },
        },
    );

    return (
        <GrowableModalForm
            show={show}
            onClose={onClose}
            title="Add Garden Team"
            initialValues={initialValues}
            onSubmit={handleSubmit}
        />
    );
};
