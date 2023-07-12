import shortid from "shortid";
import { Sample, SampleMessage } from "../../shared";
import { splitSamples, splitSamplesMulti } from "../splitSamples";

const buildSampleMessage = (...samples: Sample[]): SampleMessage => ({
  type: "sample",
  serial: "ABC123",
  timestamp: new Date("2020-07-02T02:51:29.994Z"),
  id: shortid(),
  content: samples,
});

const sample = (): Sample => ({
  probeMoisture: Math.random() * 10,
  probeAirTemp: Math.random() * 39,
  timestamp: new Date(new Date().setMonth(Math.round(Math.random() * 11))),
});

describe("splitSamples", () => {
  describe("serial but no samples", () => {
    it("should return input", () => {
      const input = buildSampleMessage();
      expect(splitSamples(input)).toEqual([input]);
    });
  });

  describe("single sample for sensor", () => {
    it("should return input", () => {
      const input = buildSampleMessage(sample());
      expect(splitSamples(input)).toEqual([input]);
    });
  });

  describe("multiple samples for single sensor", () => {
    it("should create separate entries for each sample", () => {
      const sample1: Sample = sample();
      const sample2: Sample = sample();
      const input = buildSampleMessage(sample1, sample2);
      expect(splitSamples(input)).toEqual([
        { ...buildSampleMessage(sample1), id: expect.anything() },
        { ...buildSampleMessage(sample2), id: expect.anything() },
      ]);
    });
  });
});

describe("splitSamplesMulti", () => {
  describe("multiple messages samples for multiple sensors", () => {
    it("should create separate entries for each sample", () => {
      const messages: SampleMessage[] = [
        buildSampleMessage(sample(), sample()),
        buildSampleMessage(sample(), sample()),
      ];
      expect(splitSamplesMulti(messages)).toHaveLength(4);
    });
  });
});
