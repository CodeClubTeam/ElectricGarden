export const getSignedUploadUrl = () => 'http://nowhere';

export const getSignedDownloadUrl = () => 'http://nowhere';

export const deleteAsset = (assetId: string) => {
  console.log(`Deleting asset with id: ${assetId} intercepted by mock.`);
};
