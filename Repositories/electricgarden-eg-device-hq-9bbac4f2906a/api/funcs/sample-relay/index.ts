import { sampleSchema } from "../samples-json/sampleSchema";
import {
  azureAsyncFunc,
  SampleMessage,
  SampleDelivery,
  ensureTrelloCard,
  getDeviceInfo,
  updateTrelloCardDue,
} from "../shared";
import { sendSample } from "./sendSample";

interface Result {
  multiDeliveryQueue: SampleDelivery[];
}

export default azureAsyncFunc<Result>(
  "sample-relay",
  async ({ log }, sampleMessage: SampleMessage) => {
    const { serial } = sampleMessage;
    log(`Sample relay received message for serial: ${serial}`);

    try {
      // TODO: with event subscription infrastructure (e.g. event grid)
      // we would make this a separate subscriber instead
      const device = await getDeviceInfo(log, serial);
      if (device) {
        const versions = {
          firmware: device?.firmwareVersion,
          hardware: device?.hardwareVersion,
        };

        const maybeUpdatedDevice = await ensureTrelloCard(
          log,
          device,
          versions,
          versions,
        );
        await updateTrelloCardDue(
          log,
          maybeUpdatedDevice,
          new Date(sampleMessage.timestamp),
        );
      }
    } catch (err) {
      log.warn(`Failed to update Trello. Ignoring as not critical.`, err);
    }

    const multiDeliveryQueue: SampleDelivery[] = [];

    await sendSample(log, sampleMessage, multiDeliveryQueue);

    return {
      multiDeliveryQueue,
    };
  },
);
