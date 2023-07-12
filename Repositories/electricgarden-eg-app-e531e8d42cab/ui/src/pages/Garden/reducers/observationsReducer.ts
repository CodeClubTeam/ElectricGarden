import { Reducer } from 'redux';

import * as actions from '../actions';
import { ObservationsState as GrowableObservationsState } from '../types';

type ObservationsByGrowableState = Record<string, GrowableObservationsState>;

const initialGrowableObservationsState: GrowableObservationsState = {
    fetched: false,
    fetching: false,
    observations: [],
};

export const observationsReducer: Reducer<ObservationsByGrowableState> = (
    state = {},
    action,
) => {
    if (actions.fetchObservationsForGrowableSucceeded.matchAction(action)) {
        const { growableId, observations } = action.payload;
        return {
            ...state,
            [growableId]: {
                fetched: true,
                fetching: false,
                observations,
            },
        };
    } else if (actions.updatedOrCreatedObservation.matchAction(action)) {
        const { growableId, observation } = action.payload;
        const growableState =
            state[growableId] || initialGrowableObservationsState;
        return {
            ...state,
            [growableId]: {
                ...growableState,
                observations: [
                    ...growableState.observations.filter(
                        ({ id }) => id !== observation.id,
                    ),
                    observation,
                ],
            },
        };
    } else if (actions.fetchObservationsForGrowable.matchOnStart(action)) {
        const { growableId } = action.promiseActionParams!;
        const growableState =
            state[growableId] || initialGrowableObservationsState;
        return {
            ...state,
            [growableId]: {
                ...growableState,
                fetching: true,
            },
        };
    } else if (actions.fetchObservationsForGrowable.matchOnEnd(action)) {
        const { growableId } = action.promiseActionParams!;
        const growableState =
            state[growableId] || initialGrowableObservationsState;
        return {
            ...state,
            [growableId]: {
                ...growableState,
                fetching: false,
            },
        };
    } else if (actions.removedGrowable.matchAction(action)) {
        const growableId = action.payload;
        if (state[growableId]) {
            const newState = { ...state };
            delete newState[growableId];
            return newState;
        }
    } else if (actions.removedObservation.matchAction(action)) {
        const { growableId, observationId } = action.payload;
        if (state[growableId]) {
            const newState = { ...state };
            const growableState = state[growableId];
            newState[growableId] = {
                ...growableState,
                observations: growableState.observations.filter(
                    ({ id }) => id !== observationId,
                ),
            };
            return newState;
        }
    }
    return state;
};
