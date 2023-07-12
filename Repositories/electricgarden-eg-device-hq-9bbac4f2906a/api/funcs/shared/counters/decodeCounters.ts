import { CounterEntry, EncodedCounterEntry } from "./types";
import { getCounterByType } from "./getCounterByType";

export const decodeCounters = (
  encoded: EncodedCounterEntry[],
): CounterEntry[] =>
  encoded.map(({ timestamp, type, value, encodingVersion }) => {
    const { name, error } = getCounterByType(type, encodingVersion);
    const entry: CounterEntry = {
      timestamp,
      name,
      value,
    };
    if (error) {
      entry.error = true;
    }
    return entry;
  });
