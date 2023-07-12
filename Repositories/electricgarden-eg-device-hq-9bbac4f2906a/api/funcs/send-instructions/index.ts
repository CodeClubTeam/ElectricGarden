import {
  azureAsyncFunc,
  SendInstructionsMessage,
  setDeviceHasSettingsToUpdateFlag,
  getDeviceInfo,
} from "../shared";
import { loraSendInstructions } from "./lora";

export default azureAsyncFunc(
  "send-instructions",
  async ({ log }, sendInstructionsMessage: SendInstructionsMessage) => {
    log(JSON.stringify(sendInstructionsMessage));

    const { serial } = sendInstructionsMessage;
    const deviceInfo = await getDeviceInfo(log, serial);
    if (!deviceInfo) {
      throw new Error(
        `No device found with serial: ${serial} to send instructions to.`,
      );
    }

    switch (deviceInfo.type) {
      case "catm1": {
        await setDeviceHasSettingsToUpdateFlag(log, serial, true);
        break;
      }
      case "lora": {
        await loraSendInstructions(log, deviceInfo, sendInstructionsMessage);
        break;
      }

      default:
        throw new Error(
          `Unrecognised device type: ${deviceInfo.type} for ${serial}`,
        );
    }
  },
);
