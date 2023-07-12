import { Context } from "@azure/functions";
import {
  createSendInstructionsMessage,
  getEffectiveDeviceSettings,
  getSchemaForDeviceType,
  putDeviceSettings,
} from "../../shared";
import { getDeviceInfoOrValidationError } from "../shared";

export const handlePutSettings = async (
  { log }: Context,
  serial: string,
  body: unknown,
) => {
  const deviceInfo = await getDeviceInfoOrValidationError(log, serial);

  log.info(`Validating settings for device of type: ${deviceInfo.type}.`);

  const settingsSchema = getSchemaForDeviceType(deviceInfo.type);
  const settings = settingsSchema.validateSync(body);

  log.info(`Received settings for ${serial}: "${settings}".`);

  await putDeviceSettings(serial, settings);

  const updatedSettings = await getEffectiveDeviceSettings(
    serial,
    deviceInfo.type,
  );

  log.info(
    `Sending instructions with full settings for ${serial}: "${updatedSettings}".`,
  );

  return {
    messagesToEventHub: [
      createSendInstructionsMessage(serial, updatedSettings),
    ],
    res: {
      status: 204,
      body: undefined,
    },
  };
};
