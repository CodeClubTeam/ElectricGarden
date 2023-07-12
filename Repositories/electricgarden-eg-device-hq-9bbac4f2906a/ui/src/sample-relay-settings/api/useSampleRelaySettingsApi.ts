import { getJson, putJson } from "../../api";
import { SampleRelaySettings } from "../../shared";

export type DeviceType = "lora" | "catm1";

const BASE_PATH = "sample-relay-settings";

interface Resource {
  serial: string;
  settings: SampleRelaySettings;
}

export const useSampleRelaySettingsApi = () => ({
  getDefaultSettings: async (): Promise<SampleRelaySettings> => {
    const { settings } = await getJson<Resource>(`${BASE_PATH}`);
    return settings;
  },

  putDefaultSettings: (settings: SampleRelaySettings) =>
    putJson(`${BASE_PATH}`, settings),

  getSettings: async (serial: string) => {
    const { settings } = await getJson<Resource>(`${BASE_PATH}/${serial}`);
    return settings;
  },

  putSettings: (serial: string, settings: SampleRelaySettings) =>
    putJson(`${BASE_PATH}/${serial}`, settings),
});
