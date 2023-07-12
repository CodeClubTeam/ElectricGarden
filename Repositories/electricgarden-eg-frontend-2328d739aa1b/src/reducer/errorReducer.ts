import { Reducer } from 'redux';
import { dismissError, promiseActionError } from '../actions';

interface IErrorState {
    error?: {
        message: string;
    };
}

const initialState = {};

export const errorReducer: Reducer<IErrorState> = (
    state = initialState,
    action,
) => {
    if (dismissError.matchAction(action)) {
        return initialState;
    } else if (promiseActionError.matchAction(action)) {
        const { message } = action.payload;
        return {
            error: {
                message: message || 'Untitled Error',
            },
        };
    }
    return state;
};
