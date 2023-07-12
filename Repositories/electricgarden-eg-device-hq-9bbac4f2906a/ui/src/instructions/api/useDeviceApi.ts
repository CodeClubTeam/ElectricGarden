import { DeviceAction } from "../types";
import { getJson, putJson } from "../../api";
import { DeviceSettings } from "../../shared";

export const useDeviceApi = (serial: string) => ({
  getSettings: () =>
    getJson<DeviceSettings>(`instructions/v1/${serial}/settings`),

  putSettings: (serial: string, settings: DeviceSettings) =>
    putJson(`instructions/v1/${serial}/settings`, settings),

  getActions: () =>
    getJson<DeviceAction[]>(`instructions/v1/${serial}/actions`),

  putActions: (serial: string, actions: DeviceAction[]) =>
    putJson(`instructions/v1/${serial}/actions`, actions),
});
