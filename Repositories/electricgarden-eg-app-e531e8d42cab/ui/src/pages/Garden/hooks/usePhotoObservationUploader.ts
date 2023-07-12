import { useDispatch } from 'react-redux';

import * as actions from '../actions';
import { useApi } from './../../../data/ApiProvider';
import { useCallback } from 'react';

export const usePhotoObservationUploader = () => {
    const api = useApi();
    const dispatch = useDispatch();

    const uploadPhotoObservation = useCallback(
        (growable: ServerGrowable, file: File) => {
            api.observations.addPhoto(growable.id, file).then((observation) => {
                dispatch(
                    actions.updatedOrCreatedObservation({
                        growableId: growable.id,
                        observation,
                    }),
                );
            });
        },
        [api.observations, dispatch],
    );
    return uploadPhotoObservation;
};
