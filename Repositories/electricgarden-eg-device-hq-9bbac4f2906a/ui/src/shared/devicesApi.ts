import moment from "moment";
import { useQuery } from "react-query";
import { getJson } from "../api";
import { DeviceInfo, DeviceStatus } from "./devices";
import { useUrlQuery } from "./useUrlQuery";

type Criteria = {
  lastReceivedFrom?: string;
  lastReceivedTo?: string;
};

export const useDevicesApi = () => ({
  getDevices: async (criteria: Criteria = {}) => {
    const devicesRaw = await getJson<DeviceInfoRaw[]>(`devices`, criteria);
    return devicesRaw.map(({ updatedOn, lastReceived, ...rest }) => ({
      ...rest,
      updatedOn: new Date(updatedOn),
      lastReceived: lastReceived ? new Date(lastReceived) : undefined,
    }));
  },
});

type DeviceInfoRaw = Omit<DeviceInfo, "updatedOn" | "lastReceived"> & {
  updatedOn: string;
  lastReceived: string;
};

export const useFetchDevices = () => {
  const { getDevices } = useDevicesApi();
  return useQuery(`devices`, () => getDevices());
};

export const deviceStatusToCriteria = (status: DeviceStatus) => {
  const offsetTimestamp = moment()
    .subtract(1, "days")
    .startOf("minute")
    .toISOString();
  switch (status) {
    case "active":
      return {
        lastReceivedFrom: offsetTimestamp,
      };

    case "inactive":
      return {
        lastReceivedTo: offsetTimestamp,
      };

    default:
      return {};
  }
};

export const useUrlCriteria = (): Criteria => {
  const urlQuery = useUrlQuery();

  return deviceStatusToCriteria(urlQuery.get("status") as DeviceStatus);
};

export const useFetchDevicesFiltered = (criteria: Criteria) => {
  const { getDevices } = useDevicesApi();

  return useQuery(["devices", criteria], () => getDevices(criteria));
};
