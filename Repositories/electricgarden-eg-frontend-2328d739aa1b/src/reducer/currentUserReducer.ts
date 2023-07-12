import { Reducer } from 'redux';

import { setCurrentUser } from '../actions';

export const currentUserReducer: Reducer<ServerUser | null> = (
    state = null,
    action,
) => {
    if (setCurrentUser.matchAction(action)) {
        return action.payload;
    }
    return state;
};
