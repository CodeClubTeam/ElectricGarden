export const addSerialParamToEndpoint = (
  endpoint: string,
  serial: string,
): string => {
  if (!endpoint.includes("{serial}")) {
    throw new Error(
      `Expected endpoint template url "${endpoint}" to have {serial}`,
    );
  }
  return endpoint.replace("{serial}", serial);
};
