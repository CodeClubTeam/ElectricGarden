import { Reducer } from 'react';

type State = {
    action?: {
        id: string;
        title: string;
    };
    inProgress?: boolean;
    succeeded: ServerUser[];
    failed: Array<{ user: ServerUser; error: unknown }>;
    showCompletionConfirmation?: boolean;
};

export const initialState: State = {
    succeeded: [],
    failed: [],
};

type Action =
    | { type: 'START'; payload: { actionId: string; title: string } }
    | { type: 'UPDATE_SUCCEEDED'; payload: { user: ServerUser } }
    | { type: 'UPDATE_FAILED'; payload: { user: ServerUser; error: unknown } }
    | { type: 'SHOW_CONFIRMATION' }
    | { type: 'END' };

export const bulkActionsReducer: Reducer<State, Action> = (
    state = initialState,
    action,
) => {
    switch (action.type) {
        case 'START':
            const { actionId, title } = action.payload;
            return {
                ...initialState,
                action: {
                    id: actionId,
                    title,
                },
                inProgress: true,
            };

        case 'UPDATE_SUCCEEDED': {
            const { user } = action.payload;
            return {
                ...state,
                succeeded: state.succeeded.concat(user),
            };
        }
        case 'UPDATE_FAILED': {
            const { user, error } = action.payload;
            return {
                ...state,
                failed: state.failed.concat({ user, error }),
            };
        }

        case 'SHOW_CONFIRMATION': {
            return {
                ...state,
                inProgress: false,
                showCompletionConfirmation: true,
            };
        }

        case 'END': {
            return initialState;
        }
        default:
            return state;
    }
};
