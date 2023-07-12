import React, { Dispatch, Reducer, useContext } from 'react';

export type Result = {
    pass: boolean;
    feedback?: string;
};

type State = {
    result?: Result;
};

type ActivityAction =
    | {
          type: 'PASS';
          payload: { feedback?: string };
      }
    | { type: 'FAIL'; payload: { feedback?: string } }
    | { type: 'RETRY' };

export const initialState: State = {};

export const activityReducer: Reducer<State, ActivityAction> = (
    state = initialState,
    action,
) => {
    switch (action.type) {
        case 'PASS': {
            const { feedback } = action.payload;
            return {
                result: { pass: true, feedback },
            };
        }

        case 'FAIL': {
            const { feedback } = action.payload;
            return {
                result: { pass: false, feedback },
            };
        }

        case 'RETRY':
            return {};

        default:
            return state;
    }
};

type Context = { state: State; dispatch: Dispatch<ActivityAction>; id: string };

export const ActivityContext = React.createContext<Context>(
    (null as any) as Context,
);

export const useActivityDispatch = () => {
    const { dispatch } = useContext(ActivityContext);
    return dispatch;
};

export const useActivityState = () => {
    const { state } = useContext(ActivityContext);
    return state;
};

export const useActivityId = () => {
    const { id } = useContext(ActivityContext);
    return id;
};
