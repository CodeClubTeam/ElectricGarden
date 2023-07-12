import { getJson, putJson } from "../../api";
import { DeviceSettings } from "../../shared";

export type DeviceType = "lora" | "catm1";

export const useDeviceDefaultSettingsApi = (type: DeviceType) => ({
  getDefaultSettings: () =>
    getJson<DeviceSettings>(`device-default-settings/${type}`),

  putDefaultSettings: (type: DeviceType, settings: DeviceSettings) =>
    putJson(`device-default-settings/${type}`, settings),
});
