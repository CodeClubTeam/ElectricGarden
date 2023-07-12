import { crc32 } from "crc";

export const generateUniqueTitle = (
  message: string,
  traceback: string,
): string => `${message} #${crc32(message + traceback).toString(16)}`;
