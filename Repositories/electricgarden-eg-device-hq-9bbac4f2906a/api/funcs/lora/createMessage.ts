import shortid from "shortid";
import {
  BootupMessage,
  CountersMessage,
  CounterValue,
  ErrorsMessage,
  Sample,
  SampleMessage,
} from "../shared";

export const createSampleMessage = (
  serial: string,
  samples: Sample[],
): SampleMessage => ({
  type: "sample",
  serial,
  timestamp: new Date(),
  source: "device",
  id: shortid(),
  content: samples,
});

export const createCountersMessage = (
  serial: string,
  encodingVersion: number,
  values: CounterValue[],
): CountersMessage => ({
  type: "counters",
  serial,
  timestamp: new Date(),
  source: "device",
  id: shortid(),
  content: {
    encodingVersion,
    values,
  },
});

export const createBootupMessage = (
  serial: string,
  firmware: string,
  hardware: string,
  deviceId: string,
  timeSync?: BootupMessage["content"]["timeSync"],
): BootupMessage => ({
  type: "bootup",
  serial,
  timestamp: new Date(),
  source: "device",
  id: shortid(),
  content: {
    firmware,
    hardware,
    deviceType: "lora",
    externalId: deviceId,
    timeSync,
  },
});

export const createErrorMessage = (
  serial: string,
  traceback: string,
): ErrorsMessage => ({
  type: "error",
  timestamp: new Date(),
  serial: serial,
  source: "device",
  id: shortid(),
  content: {
    message: "Lora error message",
    traceback,
  },
});
