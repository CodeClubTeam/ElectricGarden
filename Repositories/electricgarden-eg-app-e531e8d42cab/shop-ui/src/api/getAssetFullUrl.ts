const baseUrl = process.env.REACT_APP_ASSET_BASE_URL;

export const getAssetFullUrl = (path: string) => `${baseUrl}${path}`;
