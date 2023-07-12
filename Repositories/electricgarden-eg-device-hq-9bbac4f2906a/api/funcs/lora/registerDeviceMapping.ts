import { Logger } from "@azure/functions";
import { upsertLoraDevice } from "../shared";
import { RegisterDeviceMapping } from "./types";

export const registerDeviceMappingCreate = (
  log: Logger,
): RegisterDeviceMapping => async (loraDeviceId, serial) => {
  await upsertLoraDevice(log, { loraDeviceId, serial });
};
