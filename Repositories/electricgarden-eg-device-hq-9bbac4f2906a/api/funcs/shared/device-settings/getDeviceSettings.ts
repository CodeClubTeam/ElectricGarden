import { DeviceType } from "../records";
import { createBlobClient } from "./blobStorage";
import { DeviceSettings } from "./types";
import { getDeviceDefaultsName } from "./getDeviceDefaultsName";

// copy pasta from https://github.com/Azure/azure-sdk-for-js/blob/master/sdk/storage/storage-blob/samples/typescript/src/basic.ts
// why on earth is it so complicated?
// A helper method used to read a Node.js readable stream into string
async function streamToString(
  readableStream: NodeJS.ReadableStream,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: string[] = [];
    readableStream.on("data", (data) => {
      chunks.push(data.toString());
    });
    readableStream.on("end", () => {
      resolve(chunks.join(""));
    });
    readableStream.on("error", reject);
  });
}

const getSettingsJson = async (
  name: string,
  { insist }: { insist?: boolean } = {},
) => {
  const blobClient = createBlobClient(name);

  // two round trips necessary?
  if (!(await blobClient.exists())) {
    if (insist) {
      throw new Error(
        `Expected to find ${blobClient.name} in ${blobClient.accountName}/${blobClient.containerName}`,
      );
    }
    return undefined;
  }
  const downloadResponse = await blobClient.download();
  if (!downloadResponse.readableStreamBody) {
    throw new Error(`No content retrieving ${blobClient.name}.`);
  }
  const json = await streamToString(downloadResponse.readableStreamBody);
  return JSON.parse(json);
};

export const getDeviceSettings = async (
  serial: string,
  type: DeviceType,
): Promise<DeviceSettings> => {
  const settings = await getSettingsJson(serial);
  if (!settings) {
    return getDefaultDeviceSettings(type);
  }
  return settings;
};

export const getDefaultDeviceSettings = (type: DeviceType) =>
  getSettingsJson(getDeviceDefaultsName(type), {
    insist: true,
  });

export const getEffectiveDeviceSettings = async (
  serial: string,
  type: DeviceType,
) => ({
  ...(await getDefaultDeviceSettings(type)),
  ...(await getDeviceSettings(serial, type)),
});
