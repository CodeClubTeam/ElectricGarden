import shortid from "shortid";

import { SendTimeMessage } from "../shared";
import { InvalidRequestError } from "./errors";
import { getMinuteOfDay } from "./getMinuteOfDay";
import { PayloadElements, RegisterDeviceMapping } from "./types";

export const convertSendTime = async (
  { timestamp, deviceId }: PayloadElements,
  rawData: string,
  registerDeviceMapping?: RegisterDeviceMapping,
): Promise<SendTimeMessage[]> => {
  const serial = Buffer.from(rawData.substring(0, 14), "hex").toString();
  const rawTimingsPayload = rawData.substring(14);

  const deviceMinutesOffset = parseInt(rawTimingsPayload, 16);
  if (deviceMinutesOffset > 1440) {
    throw new InvalidRequestError("Invalid device time offset value (>1440)");
  }

  if (registerDeviceMapping) {
    await registerDeviceMapping(deviceId, serial);
  }

  const message: SendTimeMessage = {
    type: "sendtime",
    serial,
    timestamp: new Date(),
    source: "device",
    id: shortid(),
    content: {
      deviceId,
      offsets: {
        device: deviceMinutesOffset,
        received: getMinuteOfDay(new Date(timestamp)),
      },
    },
  };
  return [message];
};
