import React, { useReducer } from "react";
import { DataVisualisationDisplay } from "./DataVisualisationDisplay";
import { getDefaultDateRangePreset } from "./daterange";
import {
  DataGraphDispatch,
  DataGraphState,
  dataReducer,
  initialState,
} from "./state";

type Props = {
  id: number;
};

export const DataVisualisation = ({ id }: Props) => {
  const { startDate, endDate } = getDefaultDateRangePreset();
  const [dataState, dataDispatch] = useReducer(dataReducer, {
    ...initialState,
    id,
    dateRange: {
      startDate,
      endDate,
    },
  });

  return (
    <DataGraphDispatch.Provider value={dataDispatch}>
      <DataGraphState.Provider value={dataState}>
        <DataVisualisationDisplay />
      </DataGraphState.Provider>
    </DataGraphDispatch.Provider>
  );
};
