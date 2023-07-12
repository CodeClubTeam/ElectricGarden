import { Logger } from "@azure/functions";
import fetch from "node-fetch";

export const queueMessageToLoraDevice = async (
  log: Logger,
  deviceId: string,
  payloadHex: string,
) => {
  log.info(`Sending time to deviceId ${deviceId}.`);

  const endPoint =
    "https://dx-api-au1.thingpark.com/core/latest/api/devices/" +
    deviceId +
    "/downlinkMessages?confirmDownlink=true";

  const body = {
    payloadHex,
    targetPorts: "1",
  };
  log.info(`Sending ${JSON.stringify(body)} to thing park: ${endPoint}.`);
  const response = await fetch(endPoint, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization:
        "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJTVUJTQ1JJQkVSOjEwMDAwMzgzNyJdLCJleHAiOjM2OTgwMTUyNzQsImp0aSI6ImVjMDhmM2JkLWZiZjMtNDI5Mi04YzQxLTZhYjdjMWJiMGU0ZiIsImNsaWVudF9pZCI6ImlvdG56LWFwaS9taWNoYWVsK2FwaUBjb2RlY2x1Yi5ueiJ9.l4GpagVNvI-Lfh276XhNOdyi-U0_ec_j1EFgvSCKPsKDRkdaG1fpaBx0HhnMTAQu7pMOvcbHbVM9yM5VGpRv-Q",
    },
  });

  if (!response.ok) {
    const text = await response.text();
    log.error(`Error response (${response.status}) from thing park: ${text}.`);
    throw new Error(`Error POSTing to thing park: ${text}`);
  }
  const result = await response.json();
  if (result.status === "ERROR_SENDING") {
    const message = "Error response from thing park";
    log.error(message, result);
    throw new Error(`${message}: ${result.errorDescription}`);
  }
  log.info(
    `Response from thingpark: ${response.status}; ${JSON.stringify(result)}`,
  );
};
