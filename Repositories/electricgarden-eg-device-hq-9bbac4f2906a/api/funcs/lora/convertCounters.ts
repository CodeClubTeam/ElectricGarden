import { CountersMessage, CounterValue } from "../shared";
import { createCountersMessage } from "./createMessage";
import { InvalidPayloadError } from "./errors";
import { GetSerialFromDeviceId, PayloadElements } from "./types";

export type CounterPayload = {
  serial: string;
  encodingVersion: number;
  counters: CounterValue[];
};

export const convertCounters = async (
  { deviceId }: PayloadElements,
  rawData: string,
  getSerialFromDeviceId: GetSerialFromDeviceId,
): Promise<CountersMessage[]> => {
  const counterString = rawData.substring(2);
  if (counterString.length % 4 !== 0) {
    throw new InvalidPayloadError("Invalid counter payload");
  }
  const entries = counterString.split(/(.{4})/).filter((x) => x.length == 4);

  const encodingVersion = parseInt(rawData.substring(0, 2), 16);
  const serial = await getSerialFromDeviceId(deviceId);

  const counters = [];
  for (let i = 0; i < entries.length; i++) {
    if (entries[i].length !== 4) {
      continue;
    }
    const type = parseInt(entries[i].substring(0, 2), 16);
    const value = parseInt(entries[i].substring(2, 4), 16);
    counters.push({
      type: type,
      value: value,
    });
  }
  return [createCountersMessage(serial, encodingVersion, counters)];
};
