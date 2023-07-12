import { useEffect } from "react";

import { useDataDispatch, useDataState } from "./state";
import { useQuerySamples } from "./useApi";

export const useFetchSamples = () => {
  const dispatch = useDataDispatch();
  const { dateRange, id } = useDataState();

  const { status, error, data } = useQuerySamples(id, dateRange);

  useEffect(() => {
    if (status !== "success" || !data || error) {
      return;
    }
    const { dateRange, samples, sensor } = data;
    dispatch({
      type: "DATA_RECEIVED",
      payload: { sensor, samples, dateRange },
    });
    // TODO: app used dateRangeEquals to compare dates by hour rather than ms
  }, [dateRange, data, error, status, dispatch]);

  if (status === "loading") {
    return {
      status,
    };
  }

  if (status === "error") {
    return {
      status,
      error,
    };
  }

  return {
    status,
    ...data!,
  };
};
