import { Reducer } from 'redux';

import * as actions from '../actions';

interface AsyncState {
    activeRequestsByType: {
        [actionType: string]: boolean;
    };
}

const initialState: Readonly<AsyncState> = {
    activeRequestsByType: {},
};

// we can listen for when any promise action starts, completes, or errors
// and track it in state by type rather than having to track loading state
// for each seperate data type. see also anyRequestsActiveSelectorCreator in selectors/infrastructure
export const asyncStateReducer: Reducer<AsyncState> = (
    state = initialState,
    action,
) => {
    if (actions.promiseActionStart.matchAsLinkedPromiseAction(action)) {
        return {
            ...state,
            activeRequestsByType: {
                ...state.activeRequestsByType,
                [action.promiseActionType]: true,
            },
        };
    } else if (
        actions.promiseActionEnd.matchAsLinkedPromiseAction(action) ||
        actions.promiseActionError.matchAsLinkedPromiseAction(action)
    ) {
        return {
            ...state,
            activeRequestsByType: {
                ...state.activeRequestsByType,
                [action.promiseActionType]: false,
            },
        };
    }

    return state;
};
