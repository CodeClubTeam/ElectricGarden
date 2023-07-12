import React from 'react';
import { useDispatch } from 'react-redux';

import { useApi } from '../../../data/ApiProvider';
import * as actions from '../actions';
import { useSelectedGrowable } from './useSelectedGrowable';

export const useAddObservationHandler = () => {
    const [submitting, setSubmitting] = React.useState(false);
    const growable = useSelectedGrowable();
    const dispatch = useDispatch();
    const api = useApi();

    const handleAdd = React.useCallback(
        async (observation: ServerCreateObservation) => {
            const growableId = growable.id;
            setSubmitting(true);
            try {
                const savedObservation = await api.observations.add(
                    growableId,
                    observation,
                );
                setSubmitting(false);
                dispatch(
                    actions.updatedOrCreatedObservation({
                        growableId,
                        observation: savedObservation,
                    }),
                );
            } catch (error) {
                setSubmitting(false);
                throw error;
            }
        },
        [api.observations, dispatch, growable.id],
    );

    return {
        handleAdd,
        submitting,
    };
};
