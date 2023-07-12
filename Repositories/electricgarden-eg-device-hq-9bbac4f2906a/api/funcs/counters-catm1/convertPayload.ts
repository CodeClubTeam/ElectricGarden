import { CounterValue } from "../shared";

export type CounterPayload = {
  encodingVersion: number;
  counters: CounterValue[];
};

export const convertPayload = (rawPayload: string): CounterPayload => {
  const entries = rawPayload.split("|");
  const encodingVersion = parseInt(entries[0], 10);

  const counters = [];
  for (let i = 1; i < entries.length; i++) {
    if (entries[i].length !== 8) {
      continue;
    }
    const type = parseInt(entries[i].substring(0, 2), 16);
    const value = parseInt(entries[i].substring(2, 8), 16);
    counters.push({
      type: type,
      value: value,
    });
  }
  return {
    counters,
    encodingVersion,
  };
};
