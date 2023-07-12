import { useApi } from '../../../data/ApiProvider';
import * as actions from '../actions';
import { useDispatch } from 'react-redux';
import React from 'react';

export const useGrowableDeleteHandler = (growable?: ServerGrowable) => {
    const [deleting, setDeleting] = React.useState(false);
    const dispatch = useDispatch();
    const api = useApi();

    const handleDelete = React.useCallback(async () => {
        if (!growable) {
            return;
        }
        const growableId = growable.id;
        setDeleting(true);
        try {
            await api.growables.delete(growableId);
            setDeleting(false);
            dispatch(actions.removedGrowable(growableId));
        } catch (error) {
            setDeleting(false);
            throw error;
        }
    }, [api.growables, dispatch, growable]);

    return {
        handleDelete,
        deleting,
    };
};
