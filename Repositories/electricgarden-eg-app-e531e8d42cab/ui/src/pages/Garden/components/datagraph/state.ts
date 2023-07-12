import moment from 'moment';
import React, { Dispatch, Reducer, useContext } from 'react';
import { Selector } from 'react-redux';
import { VisibleMetricTypes, MetricType } from '../../../../metrics';

export const DataGraphDispatch = React.createContext<Dispatch<DataAction>>(
    (null as any) as Dispatch<DataAction>,
);

export const DataGraphState = React.createContext<PointDataState>(
    (null as any) as PointDataState,
);

export const useDataDispatch = () => useContext(DataGraphDispatch);

export const useDataState = () => useContext(DataGraphState);

export const useDataSelector = <TResult>(
    selector: Selector<PointDataState, TResult>,
) => {
    const dataState = useDataState();
    return selector(dataState);
};

export type PointDataState = {
    chartItems: VisibleMetricTypes;
    data: {
        dateRange?: DateRange;
        sensor?: Sensor;
        points: DataPoint[];
    };
    dateRange: DateRange;
};

type Sensor = { serial: string; name: string };

export const initialState: PointDataState = {
    chartItems: {
        airTemp: true,
        soilTemp: true,
        soilMoisture: true,
    },
    data: {
        points: [],
    },
    dateRange: {
        startDate: moment().startOf('day'),
        endDate: moment(),
    },
};

type DataAction =
    | {
          type: 'DATA_RECEIVED';
          payload: {
              points: DataPoint[];
              dateRange: DateRange;
              sensor: Sensor;
          };
      }
    | { type: 'SET_DATE_RANGE'; payload: DateRange }
    | {
          type: 'TOGGLE_CHART_ITEM';
          payload: { type: MetricType };
      };

export const dataReducer: Reducer<PointDataState, DataAction> = (
    state = initialState,
    action,
) => {
    switch (action.type) {
        case 'DATA_RECEIVED':
            const { sensor, points, dateRange } = action.payload;
            return {
                ...state,
                data: {
                    ...state.data,
                    sensor,
                    points,
                    dateRange,
                },
            };
        case 'SET_DATE_RANGE':
            return {
                ...state,
                dateRange: action.payload,
            };

        case 'TOGGLE_CHART_ITEM':
            const { type } = action.payload;
            return {
                ...state,
                chartItems: {
                    ...state.chartItems,
                    [type]: !state.chartItems[type],
                },
            };
    }
    return state;
};
