import type { Logger } from "@azure/functions";
import shortid from "shortid";
import type { Sample, SampleMessage } from "../shared";
import type { SamplesWithSerial, SampleWithOptionalTimestamp } from "./types";

const DAY_IN_SECONDS = 86400;

const getSeconds = (date: Date) => Math.floor(date.getTime() / 1000);

const validateSampleCreate = (log: Logger) => {
  // A buffer of a day to avoid removing valid timestamps
  const maxTimestampSeconds = getSeconds(new Date()) + DAY_IN_SECONDS;
  return (sample: SampleWithOptionalTimestamp): sample is Sample => {
    const { timestamp } = sample;
    if (timestamp === undefined) {
      log("Reading missing timestamp filtered out.");
      return false;
    }
    if (getSeconds(timestamp) > maxTimestampSeconds) {
      // Grabs current time and compares to reading timestamp
      log(
        `Filtered out reading with timestamp in the future. Value = ${timestamp}`,
      );
      return false;
    }
    return true;
  };
};

export const createSampleMessageCreate = (logger: Logger) => {
  const validateSample = validateSampleCreate(logger);
  return ({ serial, samples }: SamplesWithSerial): SampleMessage => ({
    type: "sample",
    serial,
    timestamp: new Date(),
    id: shortid(),
    source: "device",
    content: samples.filter(validateSample),
  });
};
