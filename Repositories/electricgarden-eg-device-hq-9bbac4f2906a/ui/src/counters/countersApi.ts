import { useQuery } from "react-query";

import * as api from "../api";

export const useDeviceHqApi = (serial: string) => {
  return {
    getCounters: () =>
      api.getJson<CountersByTimestamp>(`counters/v1/${serial}`),
  };
};

export const getCountersCsvUrl = (serial: string) =>
  api.buildUrl(`counters/v1/${serial}?format=csv`);

export const useFetchCounters = (serial: string) => {
  const { getCounters } = useDeviceHqApi(serial);
  return useQuery(["counters", serial], getCounters);
};

type Value = string | number;

export interface CountersByTimestamp {
  serial: string;
  values: Value[][];
}
