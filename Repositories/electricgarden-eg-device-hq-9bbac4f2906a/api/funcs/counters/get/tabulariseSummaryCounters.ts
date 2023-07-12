import zip from "lodash/zip";
import orderBy from "lodash/orderBy";

import { SummarisedCounters } from "./summariseCounters";

export type TabularisedSummaryCounters = unknown[][];

const getUniqueNames = (entries: SummarisedCounters[]): string[] => {
  const names: string[] = [];
  for (const { counters } of entries) {
    for (const { name } of counters) {
      if (!names.includes(name)) {
        names.push(name);
      }
    }
  }
  return names;
};

const getCountersTemplate = (entries: SummarisedCounters[]) => {
  const names = getUniqueNames(entries);
  const countersTemplate: GroupedSummarisedCounters["counters"] = {};
  for (const name of names) {
    countersTemplate[name] = null;
  }
  return countersTemplate;
};

type GroupedSummarisedCounters = {
  timestamp: Date;
  counters: Record<string, number | null>;
};

export const groupedSummaryCounters = (
  entries: SummarisedCounters[],
): GroupedSummarisedCounters[] => {
  const countersTemplate = getCountersTemplate(entries);
  const entriesByTimestampDesc = orderBy(entries, "timestamp", "desc");
  return entriesByTimestampDesc.map(({ timestamp, counters }) => ({
    timestamp,
    counters: counters.reduce(
      (result, counter) => {
        result[counter.name] = counter.value;
        return result;
      },
      { ...countersTemplate },
    ),
  }));
};

export const tabulariseSummaryCounters = (
  entries: SummarisedCounters[],
  { rotated }: { rotated?: boolean } = {},
): TabularisedSummaryCounters => {
  const groupedValues = groupedSummaryCounters(entries);
  if (groupedValues.length === 0) {
    return [];
  }
  const valueColumnNames = Object.keys(groupedValues[0].counters).sort();
  const columnHeaders = ["Timestamp", ...valueColumnNames];
  const rowValues: unknown[][] = [columnHeaders];
  for (const { timestamp, counters } of groupedValues) {
    const columnValues = valueColumnNames
      .map((name) => counters[name])
      .map((value) => (value !== null ? value : ""));
    rowValues.push([timestamp.toISOString(), ...columnValues]);
  }

  return rotated ? zip(...rowValues) : rowValues;
};
