import moment from "moment";
import React, { Dispatch, Reducer, useContext } from "react";
import { DateRange, Sample, VisibleMetricTypes, MetricType } from "../shared";
import { Selector } from "reselect";
import { metricTypesInSamples } from "./transforms";

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
  id: number;
  chartItems: VisibleMetricTypes;
  data: {
    dateRange?: DateRange;
    sensor?: Sensor;
    samples: Sample[];
  };
  dateRange: DateRange;
};

export type Sensor = { id: number; serial: string; title: string };

export const initialState: PointDataState = {
  id: 0,
  chartItems: {
    airTemp: true,
    soilTemp: true,
    soilMoisture: true,
    co2: true,
  },
  data: {
    samples: [],
  },
  dateRange: {
    startDate: moment().startOf("day"),
    endDate: moment(),
  },
};

type DataAction =
  | {
      type: "DATA_RECEIVED";
      payload: {
        samples: Sample[];
        dateRange: DateRange;
        sensor: Sensor;
      };
    }
  | { type: "SET_DATE_RANGE"; payload: DateRange }
  | {
      type: "TOGGLE_CHART_ITEM";
      payload: { type: MetricType };
    };

const removeChartItemsNotInData = (
  visibleItems: VisibleMetricTypes,
  samples: Sample[],
) => {
  const typesInData = metricTypesInSamples(samples);
  return Object.entries(visibleItems).reduce<VisibleMetricTypes>(
    (result, [type, selected]) => {
      result[type] = selected && typesInData.includes(type);
      return result;
    },
    {},
  );
};

export const dataReducer: Reducer<PointDataState, DataAction> = (
  state = initialState,
  action,
) => {
  switch (action.type) {
    case "DATA_RECEIVED":
      const { sensor, samples, dateRange } = action.payload;
      return {
        ...state,
        chartItems: removeChartItemsNotInData(state.chartItems, samples),
        data: {
          ...state.data,
          sensor,
          samples,
          dateRange,
        },
      };
    case "SET_DATE_RANGE":
      return {
        ...state,
        dateRange: action.payload,
      };

    case "TOGGLE_CHART_ITEM":
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
