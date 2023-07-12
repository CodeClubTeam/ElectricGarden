import { Logger } from "@azure/functions";
import { getSampleRelayEndpointTemplate } from "../shared";
import { addSerialParamToEndpoint } from "./addSerialParamToEndpoint";

export const getSampleRelayEndpoints = async (
  log: Logger,
  serial: string,
): Promise<string[]> => {
  const template = await getSampleRelayEndpointTemplate(log, serial);
  const endPoints = template
    .split(";")
    .map((t) => t.trim())
    .map((t) => addSerialParamToEndpoint(t, serial));
  return endPoints;
};
