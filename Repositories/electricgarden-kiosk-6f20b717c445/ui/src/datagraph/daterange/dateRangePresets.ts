import moment from "moment";
import { DateRange } from "../../shared/dateRange";

export type DateRangePreset = {
  title: string;
  name: string;
} & DateRange;

export const getDateRangePresets = (): DateRangePreset[] => [
  {
    name: "week",
    title: "week",
    startDate: moment().subtract(1, "weeks"),
    endDate: moment(),
  },
  {
    name: "day",
    title: "day",
    startDate: moment().startOf("day"),
    endDate: moment(),
  },
];

export const getDefaultDateRangePreset = () => {
  const presets = getDateRangePresets();
  const defaultPreset = presets.find(({ name }) => name === "week");
  if (!defaultPreset) {
    throw new Error("Default date range preset not found.");
  }
  return defaultPreset;
};
