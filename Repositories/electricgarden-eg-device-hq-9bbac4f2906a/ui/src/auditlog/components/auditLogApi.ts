import { useQuery } from "react-query";
import { getJson } from "../../api";
import { AuditLog } from "../types";

type QueryOptions = {
  type?: string;
};

export const useDeviceAuditLogApi = (serial: string) => ({
  queryAuditLog: async (options: QueryOptions = {}) => {
    type AuditLogRaw = Omit<AuditLog, "createdOn"> & { createdOn: string };
    const { entries } = await getJson<{ entries: AuditLogRaw[] }>(
      `audit-log/${serial}`,
      options,
    );
    return entries.map(
      ({ createdOn, ...rest }): AuditLog => ({
        ...rest,
        createdOn: new Date(createdOn),
      }),
    );
  },
});

export const useFetchDeviceAuditLog = (
  serial: string,
  query?: QueryOptions,
) => {
  const { queryAuditLog } = useDeviceAuditLogApi(serial);
  return useQuery(["audit-log", serial, query], () => queryAuditLog(query));
};
