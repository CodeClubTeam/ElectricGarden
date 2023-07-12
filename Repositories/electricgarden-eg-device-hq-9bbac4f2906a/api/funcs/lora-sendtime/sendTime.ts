import { Logger } from "@azure/functions";
import { queueMessageToLoraDevice, SendTimeMessage } from "../shared";
import { encodeSendTime } from "./encodeSendTime";

export const sendTime = async (log: Logger, message: SendTimeMessage) => {
  const {
    serial,
    content: { deviceId },
  } = message;

  log.info(
    `Sending time to device with serial: ${serial} (deviceId ${deviceId}).`,
  );

  const payloadHex = encodeSendTime(message);
  await queueMessageToLoraDevice(log, deviceId, payloadHex);
};
