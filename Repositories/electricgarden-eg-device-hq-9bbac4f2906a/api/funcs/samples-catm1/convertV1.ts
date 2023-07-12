import { signalToRssi } from "./signalToRssi";
import { timestampParse } from "./timestampParse";
import { Converter, SampleWithOptionalTimestamp } from "./types";

const getValue = (value: string) => (value ? Number(value) : undefined);

export const convertV1: Converter = (entries) => {
  let serial: string | undefined;
  const samples: SampleWithOptionalTimestamp[] = [];

  for (const entry of entries) {
    const [deviceRaw, timestampRaw, signalRaw] = entry.split(";");
    const timestamp = timestampParse(timestampRaw);
    const rssi = signalToRssi(signalRaw);

    const split = deviceRaw.split(":");
    serial = split[0];
    const sample: SampleWithOptionalTimestamp = {
      probeSoilTemp: getValue(split[1]),
      probeAirTemp: getValue(split[2]),
      batteryVoltage: getValue(split[3]),
      ambientTemp: getValue(split[4]),
      probeMoisture: getValue(split[5]),
      rssi,
      timestamp,
      light: getValue(split[6]),
      ambientHumidity: getValue(split[7]),
      errorCode: getValue(split[8]),
    };
    samples.push(sample);
  }
  if (!serial) {
    throw new Error("No sample found");
  }
  return {
    serial,
    samples,
  };
};
