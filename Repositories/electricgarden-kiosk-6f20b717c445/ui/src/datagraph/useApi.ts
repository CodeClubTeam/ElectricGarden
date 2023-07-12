import { useQuery } from "react-query";
import {
  cleanSample,
  DateRange,
  getJson,
  SampleRaw,
  HttpResponseError,
} from "../shared";
import { Sensor } from "./state";

interface SamplesResponse {
  sensor: Sensor;
  dateRange: DateRange;
  samples: SampleRaw[];
}

export const useApi = () => ({
  getSamples: async (sensorId: number, { startDate, endDate }: DateRange) => {
    const { samples, ...rest } = await getJson<SamplesResponse>(
      `/samples/${sensorId}`,
      {
        from: startDate.toISOString(),
        to: endDate.toISOString(),
      },
    );
    return {
      ...rest,
      samples: samples.map(cleanSample),
    };
  },
  getDeviceFromSerial: (serial: string | number) =>
    getJson<Sensor>(`/device-installations-by-serial/${serial}`),
});

export const useQuerySamples = (sensorId: number, dateRange: DateRange) => {
  const { getSamples } = useApi();

  return useQuery(
    ["samples", sensorId, dateRange],
    () => getSamples(sensorId, dateRange),
    {
      retry: (failCount, error) => {
        if (error instanceof HttpResponseError) {
          return error.response.status !== 404;
        }
        return failCount < 2;
      },
    },
  );
};

export const useQueryDeviceInfoBySerial = (serial: string) => {
  const { getDeviceFromSerial } = useApi();
  return useQuery(["deviceInfo", serial], () => getDeviceFromSerial(serial));
};
