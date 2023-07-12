import { Logger } from "@azure/functions";
import { deliverSample, SampleDelivery, SampleMessage } from "../shared";
import { getSampleRelayEndpoints } from "./getSampleRelayEndpoint";

export const sendSample = async (
  log: Logger,
  { serial, content: samples }: SampleMessage,
  multiDeliveryQueue: SampleDelivery[],
) => {
  const endPoints = await getSampleRelayEndpoints(log, serial);
  if (samples.length === 0) {
    throw new Error("No sample to send!");
  }
  if (samples.length > 1) {
    throw new Error(`Only one sample at a time`);
  }
  if (endPoints.length === 0) {
    log(`No relay endpoints configured, skipping.`);
    return;
  }
  const sample = samples[0];
  if (endPoints.length > 1) {
    log.info(
      `${endPoints.length} relay endpoints. Enqueing for separate processing.`,
    );
    for (const endPoint of endPoints) {
      log.info(`Enqueued sample for delivery to: ${endPoint}`);
      multiDeliveryQueue.push({
        endPoint,
        sample,
      });
    }
    return;
  }

  const endPoint = endPoints[0];
  if (endPoint.length === 0) {
    log(`No relay endpoints configured, skipping.`);
    return;
  }

  log.info(`Relaying sample immediately.`);
  return deliverSample(log, { endPoint, sample });
};
