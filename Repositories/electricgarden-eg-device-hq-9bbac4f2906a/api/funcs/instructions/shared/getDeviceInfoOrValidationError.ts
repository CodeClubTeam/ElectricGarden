import { Logger } from "@azure/functions";
import * as yup from "yup";
import { DeviceInfo, getDeviceInfo } from "../../shared";

export const getDeviceInfoOrValidationError = async (
  log: Logger,
  serial: string,
): Promise<DeviceInfo> => {
  const deviceInfo = await getDeviceInfo(log, serial);
  if (!deviceInfo) {
    throw new yup.ValidationError(
      `No device found with serial: ${serial}`,
      "",
      "",
    );
  }
  return deviceInfo;
};
