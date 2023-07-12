import { Logger } from "@azure/functions";

import { getLoraDeviceSerialByLoraDeviceId } from "../shared";
import { InvalidRequestError } from "./errors";
import { GetSerialFromDeviceId } from "./types";

export const getSerialFromDeviceIdCreate = (
  log: Logger,
): GetSerialFromDeviceId => async (loraDeviceId) => {
  const serial = await getLoraDeviceSerialByLoraDeviceId(log, loraDeviceId);
  if (!serial) {
    // slightly hacky as pure function shouldn't really know anything about context
    throw new InvalidRequestError(
      `No lora device registered with serial for device id: ${loraDeviceId}`,
    );
  }
  return serial;
};
