import { convertV1 } from "./convertV1";
import { convertV2 } from "./convertV2";
import { Converter } from "./types";

const getConverter = (entries: string[]): Converter => {
  const formatter = entries[0].split(",");
  if (formatter.length <= 2) {
    return convertV1;
  } else {
    return convertV2;
  }
};

export const convert = (payload: string) => {
  const entries = payload.split("|");
  const convert = getConverter(entries);

  return convert(entries);
};
