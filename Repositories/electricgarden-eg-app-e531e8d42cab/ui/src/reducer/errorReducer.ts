import { Reducer } from 'redux';
import * as actions from '../actions';

interface IErrorState {
    error?: {
        messages: string[];
    };
}

const initialState = {};

export const errorReducer: Reducer<IErrorState> = (
    state = initialState,
    action,
) => {
    if (actions.dismissError.matchAction(action)) {
        return initialState;
    } else if (actions.promiseActionError.matchAction(action)) {
        const { message } = action.payload;
        return {
            error: {
                messages: [message || 'Untitled Error'],
            },
        };
    } else if (actions.httpError.matchAction(action)) {
        const {
            response: { status, statusText },
            message,
        } = action.payload;

        return {
            error: {
                messages: [
                    `Error response received from the server: ${status} ${statusText}.`,
                    ...[message],
                ],
            },
        };
    } else if (actions.uiError.matchAction(action)) {
        const { error } = action.payload;
        return {
            error: {
                messages: [`Unexpected error: ${error.message}`],
            },
        };
    } else if (actions.httpValidationErrorReceived.matchAction(action)) {
        const { validationErrors } = action.payload;
        return {
            error: {
                messages: validationErrors,
            },
        };
    }
    return state;
};
