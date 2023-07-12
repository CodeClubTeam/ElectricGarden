import { decodeHexSample } from "../shared";
import { signalToRssi } from "./signalToRssi";
import { timestampParse } from "./timestampParse";
import { Converter, SampleWithOptionalTimestamp } from "./types";

export const convertV2: Converter = (strings) => {
  const [header, ...entries] = strings;
  const [serial, dateRaw, timeRaw, signalRaw] = header.split(",");

  const samples: SampleWithOptionalTimestamp[] = [];

  const baseTimestampSeconds = Math.floor(
    timestampParse(dateRaw + "," + timeRaw)?.getTime() / 1000,
  );
  const rssi = signalToRssi(signalRaw);
  for (const entry of entries) {
    const sampleRaw = decodeHexSample(entry);
    if (!sampleRaw) {
      continue;
    }
    const { offset, ...sample } = sampleRaw;
    const timestampSeconds = baseTimestampSeconds - offset * 60;
    const timestamp = new Date(timestampSeconds * 1000);

    samples.push({
      ...sample,
      rssi,
      timestamp,
    });
  }

  return {
    serial,
    samples,
  };
};
