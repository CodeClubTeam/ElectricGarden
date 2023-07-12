import { Logger } from "@azure/functions";
import { SampleMessage } from "../../shared";
import { createSampleMessageCreate } from "../createSampleMessage";
import { SamplesWithSerial, SampleWithOptionalTimestamp } from "../types";

const exampleSample: SampleWithOptionalTimestamp = {
  ambientHumidity: 12,
  ambientTemp: 13,
  batteryVoltage: 14,
  errorCode: 1,
  light: 8,
  probeAirTemp: 9,
  co2: 400,
  probeMoisture: 10,
  probeSoilTemp: 11,
  rssi: 12,
  snr: 13,
  timestamp: new Date(),
};

const serial = "ABC123";

const normalizeTimestamp = (timestamp: Date) =>
  Math.floor(timestamp.getTime() / 1000);

describe("createSampleMessage", () => {
  let logMessages: string[] = [];
  let createSampleMessage: ReturnType<typeof createSampleMessageCreate>;
  let result: SampleMessage;

  beforeEach(() => {
    logMessages = [];
    const log: Logger = ((message: string) => logMessages.push(message)) as any;
    createSampleMessage = createSampleMessageCreate(log);
  });

  describe("input with valid samples", () => {
    const input: SamplesWithSerial = {
      serial,
      samples: [exampleSample],
    };

    beforeEach(() => {
      result = createSampleMessage(input);
    });

    it("should have type 'sample'", () => {
      expect(result.type).toBe("sample");
    });

    it("should have input serial", () => {
      expect(result.serial).toBe(input.serial);
    });

    it("should have timestamp", () => {
      expect(normalizeTimestamp(result.timestamp)).toBe(
        normalizeTimestamp(new Date()),
      );
    });

    it("should have content with all input samples", () => {
      expect(result.content).toEqual(input.samples);
    });
  });

  describe("timestamp undefined", () => {
    const input: SamplesWithSerial = {
      serial,
      samples: [{ ...exampleSample, timestamp: undefined }, exampleSample],
    };

    beforeEach(() => {
      result = createSampleMessage(input);
    });

    it("should remove invalid sample", () => {
      expect(result.content).toEqual([exampleSample]);
    });

    it("should log one error", () => {
      expect(logMessages).toHaveLength(1);
    });
  });

  describe("timestamp in the future", () => {
    const input: SamplesWithSerial = {
      serial,
      samples: [
        { ...exampleSample, timestamp: new Date(new Date().setFullYear(2070)) },
      ],
    };

    beforeEach(() => {
      result = createSampleMessage(input);
    });

    it("should remove future sample", () => {
      expect(result.content).toEqual([]);
    });

    it("should log one error", () => {
      expect(logMessages).toHaveLength(1);
    });
  });
});
