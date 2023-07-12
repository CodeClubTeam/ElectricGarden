import React, { Reducer, useCallback, useReducer } from 'react';

type Context = Readonly<{
    passedById: Record<string, boolean>;
    pass: (id: string) => void;
    register: (id: string) => () => void;
}>;

const ActivityCompletionContext = React.createContext<Context>(
    ({} as any) as Context,
);

type State = Record<string, boolean>;

type Action =
    | { type: 'REGISTER'; payload: { id: string } }
    | { type: 'DEREGISTER'; payload: { id: string } }
    | { type: 'PASS'; payload: { id: string } };

const checkId = (id: string) => {
    if (!id) {
        throw new Error(`Id required on activity register.`);
    }
};

const reducer: Reducer<State, Action> = (state = {}, action) => {
    switch (action.type) {
        case 'REGISTER': {
            const { id } = action.payload;
            checkId(id);
            if (state[id]) {
                throw new Error(`Duplicate activity id: ${id}.`);
            }
            return {
                ...state,
                [id]: false,
            };
        }

        case 'DEREGISTER': {
            const { id } = action.payload;
            checkId(id);
            const newState = { ...state };
            delete newState[id];
            return newState;
        }

        case 'PASS': {
            const { id } = action.payload;
            checkId(id);
            if (!(id in state)) {
                throw new Error(`No activity with id: ${id}.`);
            }
            return {
                ...state,
                [id]: true,
            };
        }

        default:
            return state;
    }
};

export const ActivityCompletionContextProvider: React.FC = ({ children }) => {
    const [passedById, dispatch] = useReducer(reducer, {});

    const pass = useCallback((id: string) => {
        dispatch({ type: 'PASS', payload: { id } });
    }, []);

    const register = useCallback((id: string) => {
        dispatch({ type: 'REGISTER', payload: { id } });
        return () => dispatch({ type: 'DEREGISTER', payload: { id } });
    }, []);

    return (
        <ActivityCompletionContext.Provider
            value={{ passedById, pass, register }}
        >
            {children}
        </ActivityCompletionContext.Provider>
    );
};

export const useActivityCompletion = () =>
    React.useContext(ActivityCompletionContext);

export const useAnyIncompleteActivities = () => {
    const { passedById } = useActivityCompletion();
    const anyIncomplete = React.useMemo(
        () => !!Object.entries(passedById).find(([, completed]) => !completed),
        [passedById],
    );
    return anyIncomplete;
};

export const useActivityRegistrar = () => {
    const { pass, register } = useActivityCompletion();

    return {
        register,
        pass,
    };
};

// each activity registers itself via a hook with an id
// if any activity registers, the canComplete is set to false
// when an activity is set to passed, this is passed on to track completions
// when all activities are passed, canComplete is set to true

// activity completion context is at above section, just has boolean canComplete
// section uses it to enable/disable Next button

// content completion context just wraps lesson content
// has register state, activity passed lookup and hooks
// updates activity completion context
// - sets canComplete to false on register
// - sets canComplete to true on last pass
