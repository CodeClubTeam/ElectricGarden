import { useApi } from '../../../data/ApiProvider';
import * as actions from '../actions';
import { useDispatch } from 'react-redux';
import React from 'react';

export const useObservationDeleteHandler = (
    growable: ServerGrowable,
    observation: ServerObservation,
) => {
    const [deleting, setDeleting] = React.useState(false);
    const dispatch = useDispatch();
    const api = useApi();

    const handleDelete = React.useCallback(async () => {
        const growableId = growable.id;
        const observationId = observation.id;
        setDeleting(true);
        try {
            await api.observations.remove(growableId, observationId);
            setDeleting(false);
            dispatch(actions.removedObservation({ growableId, observationId }));
        } catch (error) {
            setDeleting(false);
            throw error;
        }
    }, [api.observations, dispatch, growable.id, observation.id]);

    return {
        handleDelete,
        deleting,
    };
};
