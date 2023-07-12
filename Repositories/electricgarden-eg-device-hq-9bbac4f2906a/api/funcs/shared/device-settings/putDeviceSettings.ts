import {
  DEVICE_SETTINGS_CONTAINER,
  getBlobName,
  createBlobService,
} from "./blobStorage";
import { DeviceSettings } from "./types";
import { DeviceInfo } from "../records";
import { getDeviceDefaultsName } from "./getDeviceDefaultsName";

export const putDeviceSettings = async (
  name: string,
  settings: Partial<DeviceSettings>,
) => {
  const blobService = createBlobService();
  return new Promise((resolve, reject) =>
    blobService.createBlockBlobFromText(
      DEVICE_SETTINGS_CONTAINER,
      getBlobName(name),
      JSON.stringify(settings, undefined, "  "),
      {
        contentSettings: {
          contentType: "application/json",
        },
      },
      (err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      },
    ),
  );
};

export const putDeviceDefaultSettings = (
  type: DeviceInfo["type"],
  settings: Parameters<typeof putDeviceSettings>[1],
) => putDeviceSettings(getDeviceDefaultsName(type), settings);
