import { BootupMessage } from "../shared";
import { TimeSyncMinuteOfDays } from "../shared/messageTypes/shared";
import { createBootupMessage } from "./createMessage";
import { getMinuteOfDay } from "./getMinuteOfDay";
import { InvalidPayloadError } from "./errors";
import { PayloadElements, RegisterDeviceMapping } from "./types";

export const convertBootup = async (
  { deviceId, timestamp }: PayloadElements,
  rawData: string,
  registerDeviceMapping?: RegisterDeviceMapping,
): Promise<BootupMessage[]> => {
  if (rawData.length !== 22) {
    throw new InvalidPayloadError("Invalid message size");
  }
  const serial = Buffer.from(rawData.substring(0, 14), "hex").toString();
  const firm = parseInt(rawData.substring(14, 16), 16).toString();
  const hard = parseInt(rawData.substring(16, 18), 16).toString();
  const firmware = firm.substring(0, 1) + "." + firm.substring(1);
  const hardware = hard.substring(0, 1) + "." + hard.substring(1);

  const deviceMinutesOffset = parseInt(rawData.substring(18, 22), 16);
  if (deviceMinutesOffset > 1440) {
    throw new InvalidPayloadError("Invalid device time offset value (>1440)");
  }

  const timeData: TimeSyncMinuteOfDays = {
    device: deviceMinutesOffset,
    clock: getMinuteOfDay(new Date(timestamp)),
  };

  if (registerDeviceMapping) {
    await registerDeviceMapping(deviceId, serial);
  }

  return [createBootupMessage(serial, firmware, hardware, deviceId, timeData)];
};
