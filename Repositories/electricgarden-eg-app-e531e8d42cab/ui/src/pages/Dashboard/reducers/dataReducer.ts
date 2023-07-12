import { Reducer } from 'redux';

import * as actions from '../actions';

export type SensorSerialFetchable = FetchState & {
    data: DataPoint[];
};

export type DataReducerState = {
    [serial: string]: SensorSerialFetchable;
};

const initialState: DataReducerState = {};

export const dataReducer: Reducer<DataReducerState> = (
    state = initialState,
    action,
) => {
    if (actions.fetchDataSucceeded.matchAction(action)) {
        const { sensorSerial, data } = action.payload;
        return {
            ...state,
            [sensorSerial]: {
                ...state[sensorSerial],
                data,
            },
        };
    } else if (actions.fetchData.matchOnStart(action)) {
        const { sensorSerial } = action.promiseActionParams!;
        return {
            ...state,
            [sensorSerial]: {
                ...state[sensorSerial],
                fetching: true,
            },
        };
    } else if (actions.fetchData.matchOnEnd(action)) {
        const { sensorSerial } = action.promiseActionParams!;
        return {
            ...state,
            [sensorSerial]: {
                ...state[sensorSerial],
                fetching: false,
                fetched: true,
            },
        };
    } else if (actions.fetchData.matchOnError(action)) {
        const { sensorSerial } = action.promiseActionParams!;
        return {
            ...state,
            [sensorSerial]: {
                ...state[sensorSerial],
                data: [],
            },
        };
    }

    return state;
};
