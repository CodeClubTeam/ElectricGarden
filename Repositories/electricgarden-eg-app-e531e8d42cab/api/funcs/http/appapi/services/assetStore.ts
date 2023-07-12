import {
  generateBlobSASQueryParameters,
  SharedKeyCredential,
} from '@azure/storage-blob';
import { getRequiredConfig } from '@eg/core';
import fetch from 'node-fetch';

const getDateAsMinutesAfterNow = (minutes: number) =>
  new Date(new Date().setMinutes(new Date().getMinutes() + minutes));

type GetSignedUrlOptions = {
  permissions?: string;
  expiryMinutes?: number;
};

const getCredential = () => {
  // TODO: see if can use account connection string instead since in function appsettings already?
  const account = getRequiredConfig('STORAGE_ACCOUNT');
  const accountKey = getRequiredConfig('STORAGE_ACCOUNT_KEY');
  return new SharedKeyCredential(account, accountKey);
};

const getSignedUrl = (
  assetId: string,
  { permissions, expiryMinutes }: GetSignedUrlOptions = {},
) => {
  const containerName = 'photos';
  const blobName = assetId;
  const sasToken = generateBlobSASQueryParameters(
    {
      blobName,
      containerName,
      cacheControl: 'private,immutable,max-age=31536000', // try to prevent re-fetches
      expiryTime: getDateAsMinutesAfterNow(expiryMinutes || 3),
      permissions,
    },
    getCredential(),
  ).toString();

  const account = getRequiredConfig('STORAGE_ACCOUNT');
  return `https://${account}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;
};

export const getSignedUploadUrl = (assetId: string) =>
  getSignedUrl(assetId, { permissions: 'raw' });

export const getSignedDownloadUrl = (assetId: string) =>
  getSignedUrl(assetId, { permissions: 'r', expiryMinutes: 24 * 60 }); // make it a day because react routing will re-fetch

export const deleteAsset = (assetId: string) => {
  const url = getSignedUrl(assetId, { permissions: 'd' });
  return fetch(url, { method: 'DELETE' });
};
