import groupBy from "lodash/groupBy";
import { CounterEntry } from "../../shared";

export type SummarisedCounter = {
  name: string;
  value: number;
};

export type SummarisedCounters = {
  timestamp: Date;
  counters: SummarisedCounter[];
};

export const summariseCounters = (
  records: CounterEntry[],
): SummarisedCounters[] => {
  const byTimestamp = groupBy(records, ({ timestamp }) =>
    timestamp.toISOString(),
  );
  return Object.entries(byTimestamp).map(([timestamp, entries]) => ({
    timestamp: new Date(timestamp),
    counters: entries.map(({ name, value, error }) => ({
      name,
      value,
      error,
    })),
  }));
};
