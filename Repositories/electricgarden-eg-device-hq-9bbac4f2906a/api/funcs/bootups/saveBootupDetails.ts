import { Context } from "@azure/functions";

import { BootupMessage, DeviceInfo } from "../shared";
import { getDeviceInfo, upsertDevice } from "../shared/tables";

export const saveBootup = async (
  log: Context["log"],
  serial: string,
  existingDevice: DeviceInfo | undefined,
  { deviceType, firmware, hardware, externalId }: BootupMessage["content"],
) => {
  const bootupDetails = {
    type: deviceType,
    firmwareVersion: firmware,
    hardwareVersion: hardware,
    externalDeviceId: externalId,
  };
  await upsertDevice(log, {
    ...(existingDevice ?? {
      serial,
    }),
    ...bootupDetails,
  });
  const device = await getDeviceInfo(log, serial);
  if (!device) {
    throw new Error(`Upsert failed`); // shouldn't happen
  }
  return device;
};
