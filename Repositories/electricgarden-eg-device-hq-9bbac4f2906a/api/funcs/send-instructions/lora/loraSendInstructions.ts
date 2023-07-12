import { Logger } from "@azure/functions";
import {
  queueMessageToLoraDevice,
  SendInstructionsMessage,
  DeviceInfo,
} from "../../shared";
import { encodeSendInstructions } from "./encodeSendInstructions";

export const loraSendInstructions = async (
  log: Logger,
  { serial, type, externalDeviceId: deviceId, firmwareVersion }: DeviceInfo,
  message: SendInstructionsMessage,
) => {
  if (type !== "lora") {
    throw new Error(`Not a lora device!`);
  }
  if (!deviceId) {
    throw new Error(`No externalDeviceId found on lora device info!`);
  }

  if (!firmwareVersion) {
    log.info(
      `No firmware version, assuming v1 device and not sending instructions`,
    );
    return;
  }
  log.info(
    `Sending instructions to device with serial: ${serial} (deviceId ${deviceId}).`,
  );

  const payloadHex = encodeSendInstructions(message);
  await queueMessageToLoraDevice(log, deviceId, payloadHex);
};
