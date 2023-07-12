import { getRequiredSetting } from "../../getRequiredSetting";
import { getDeviceInfo } from "./getDeviceInfo";
import { Logger } from "@azure/functions";
import { upsertDevice } from "./upsertDeviceInfo";

export const getSampleRelayDefaultEndpointTemplate = () =>
  getRequiredSetting("APP_SAMPLES_ENDPOINT_DEFAULT");

export const getSampleRelayEndpointTemplate = async (
  log: Logger,
  serial: string,
) => {
  const info = await getDeviceInfo(log, serial);
  const override = info?.appSamplesEndpointOverride;
  const setting = override || getSampleRelayDefaultEndpointTemplate();
  log.info(`Sample endpoint setting: ${setting}`);
  return setting;
};

export const setSampleRelayEndpointTemplate = async (
  log: Logger,
  serial: string,
  endpointTemplate: string | undefined,
) => {
  const deviceInfo = await getDeviceInfo(log, serial);
  if (!deviceInfo) {
    throw new Error(`Device not registered: ${serial}.`);
  }
  await upsertDevice(log, {
    ...deviceInfo,
    appSamplesEndpointOverride: endpointTemplate,
  });
};
