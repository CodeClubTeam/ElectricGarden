import { Logger } from "@azure/functions";
import * as yup from "yup";

import { DeviceInfo, getAllDevices, querySampleMetrics } from "../../shared";

const lastReceivedCriteriaSchema = yup.object({
  lastReceivedFrom: yup.date(),
  lastReceivedTo: yup.date(),
});

type DeviceInfoWithLastReceived = DeviceInfo & { lastReceived?: Date };

const getDevicesWithLastReceived = async (
  log: Logger,
  query: Record<string, string>,
): Promise<DeviceInfoWithLastReceived[]> => {
  const lastReceived = lastReceivedCriteriaSchema.validateSync(query);

  // no joins with azure tables. if this gets out of hand we may need to move to relational db
  log.info(`Received request of devices: ${JSON.stringify(query)}.`);
  const { lastReceivedFrom: from, lastReceivedTo: to } = lastReceived ?? {};
  const [devices, sampleMetrics] = await Promise.all([
    getAllDevices(log),
    querySampleMetrics(log, { lastReceived: { from, to } }),
  ]);
  log.info(
    `Received ${devices.length} devices and ${sampleMetrics.length} matches.`,
  );
  return devices
    .map((device) => {
      const metric = sampleMetrics.find((m) => m.serial === device.serial);
      if (!metric) {
        if (from || to) {
          return undefined;
        }
        return device;
      }
      return {
        ...device,
        lastReceived: metric.lastReceived,
      };
    })
    .filter((m): m is DeviceInfoWithLastReceived => !!m);
};

export const handleGetAll = async (
  log: Logger,
  query: Record<string, string>,
) => {
  log.info(`Received request of devices.`);

  const devices = await getDevicesWithLastReceived(log, query);

  return {
    res: {
      status: 200,
      body: devices,
    },
  };
};
