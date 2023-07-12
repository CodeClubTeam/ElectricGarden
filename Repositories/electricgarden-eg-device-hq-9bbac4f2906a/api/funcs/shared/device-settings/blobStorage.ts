import {
  BlobServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";
import azure from "azure-storage";
import { getRequiredSetting } from "../getRequiredSetting";

export const DEVICE_SETTINGS_CONTAINER = "devicesettings";

const account = getRequiredSetting("STORAGE_ACCOUNT");

const accountKey = getRequiredSetting("STORAGE_ACCOUNT_KEY");

const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);

export const getBlobName = (serial: string) => `${serial}.json`;

export const createBlobService = () =>
  azure.createBlobService(account, accountKey);

export const createBlobClient = (name: string) => {
  const blobServiceClient = new BlobServiceClient(
    // When using AnonymousCredential, following url should include a valid SAS or support public access
    `https://${account}.blob.core.windows.net`,
    sharedKeyCredential,
  );
  const containerClient = blobServiceClient.getContainerClient(
    DEVICE_SETTINGS_CONTAINER,
  );

  return containerClient.getBlobClient(getBlobName(name));
};
