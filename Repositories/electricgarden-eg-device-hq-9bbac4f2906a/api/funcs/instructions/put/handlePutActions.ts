import { Context } from "@azure/functions";
import { actionsValidator, getDeviceInfoOrValidationError } from "../shared";
import { InstructionsResponse } from "../shared/types";
import {
  deleteActions,
  createActionRecord,
  createSendInstructionsMessage,
  getEffectiveDeviceSettings,
} from "../../shared";
import * as yup from "yup";

export const handlePutActions = async (
  { log }: Context,
  serial: string,
  body: unknown,
): Promise<InstructionsResponse> => {
  const actions = actionsValidator.validateSync(body);

  log.info(`Received actions for ${serial}: "${body}".`);

  const deviceInfo = await getDeviceInfoOrValidationError(log, serial);
  if (deviceInfo.type === "lora") {
    throw new yup.ValidationError("Lora devices do no support actions", "", "");
  }

  await deleteActions(log, serial);

  const settings = await getEffectiveDeviceSettings(serial, deviceInfo.type);

  return {
    table: actions.map((action) => createActionRecord(serial, action)),
    messagesToEventHub: [createSendInstructionsMessage(serial, settings)],
    res: {
      status: 204,
      body: undefined,
    },
  };
};
