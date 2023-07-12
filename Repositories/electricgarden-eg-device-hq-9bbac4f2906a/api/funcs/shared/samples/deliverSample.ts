import { Logger } from "@azure/functions";
import fetch from "node-fetch";
import { SampleDelivery } from "./sampleDelivery";

export const deliverSample = async (
  log: Logger,
  { endPoint, sample }: SampleDelivery,
) => {
  log.info(`Relaying sample with POST to: ${endPoint}`);
  const response = await fetch(endPoint, {
    method: "POST",
    body: JSON.stringify(sample),
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error sending sample: ${error}`);
  }
  log.info(
    `Sent sample successfully to : ${endPoint}: "${JSON.stringify(sample)}"`,
  );
};
