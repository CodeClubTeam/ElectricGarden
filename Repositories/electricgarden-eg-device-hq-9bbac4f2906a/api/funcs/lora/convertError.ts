import { ErrorsMessage } from "../shared";
import { createErrorMessage } from "./createMessage";
import { GetSerialFromDeviceId, PayloadElements } from "./types";

export const convertError = async (
  { deviceId }: PayloadElements,
  errorData: string,
  getSerialFromDeviceId: GetSerialFromDeviceId,
): Promise<ErrorsMessage[]> => {
  const errorString = Buffer.from(errorData, "hex").toString();
  const serial = await getSerialFromDeviceId(deviceId);

  return [createErrorMessage(serial, errorString)];
};
