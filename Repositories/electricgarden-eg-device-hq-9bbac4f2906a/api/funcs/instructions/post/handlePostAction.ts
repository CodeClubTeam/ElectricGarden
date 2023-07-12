import { Context } from "@azure/functions";
import { actionSchema, getDeviceInfoOrValidationError } from "../shared";
import {
  createActionRecord,
  createSendInstructionsMessage,
  getEffectiveDeviceSettings,
} from "../../shared";
import * as yup from "yup";

export const handlePostAction = async (
  { log }: Context,
  serial: string,
  body: unknown,
) => {
  const actions = actionSchema.validateSync(body);

  log.info(`Received action for ${serial}: "${body}".`);

  const deviceInfo = await getDeviceInfoOrValidationError(log, serial);
  if (deviceInfo.type === "lora") {
    throw new yup.ValidationError("Lora devices do no support actions", "", "");
  }

  const settings = await getEffectiveDeviceSettings(serial, deviceInfo.type);

  return {
    table: [createActionRecord(serial, actions)],
    messagesToEventHub: [createSendInstructionsMessage(serial, settings)],
    res: {
      status: 204,
      body: undefined,
    },
  };
};
