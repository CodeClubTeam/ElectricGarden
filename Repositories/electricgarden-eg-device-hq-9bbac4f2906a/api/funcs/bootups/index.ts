import {
  azureAsyncFunc,
  BootupMessage,
  createSendInstructionsMessage,
  ensureTrelloCard,
  getDeviceInfo,
  getEffectiveDeviceSettings,
  Message,
} from "../shared";
import { saveBootup } from "./saveBootupDetails";

interface Result {
  messagesToEventHub: Message[];
}

export default azureAsyncFunc<Result>(
  "bootups",
  async ({ log }, bootupMessage: BootupMessage) => {
    const { serial, content } = bootupMessage;

    log(`Bootup from ${serial}: ${JSON.stringify(content)}`);

    const originalDevice = await getDeviceInfo(log, serial);
    const device = await saveBootup(log, serial, originalDevice, content);

    try {
      // TODO: with event subscription infrastructure (e.g. event grid)
      // we would make this a separate subscriber instead
      await ensureTrelloCard(
        log,
        device,
        {
          firmware: originalDevice?.firmwareVersion,
          hardware: originalDevice?.hardwareVersion,
        },
        bootupMessage.content,
      );
    } catch (err) {
      log.warn(`Failed to ensure trello card. Ignoring as not critical.`, err);
    }

    // deliver instructions via thing park after a lora device bootup
    if (device.type === "lora") {
      const settings = await getEffectiveDeviceSettings(serial, device.type);
      return {
        messagesToEventHub: [
          createSendInstructionsMessage(serial, settings, content.timeSync),
        ],
      };
    }

    return {
      messagesToEventHub: [],
    };
  },
);
