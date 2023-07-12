import { CounterEntry } from "../../../shared";
import { summariseCounters, SummarisedCounters } from "../summariseCounters";

describe("summarise counters", () => {
  describe("no counters", () => {
    it("should return empty", () => {
      expect(summariseCounters([])).toEqual([]);
    });
  });

  describe("single counter record", () => {
    let input: CounterEntry;
    let output: SummarisedCounters;

    beforeEach(() => {
      input = {
        name: "ErLo_TransmitFail",
        timestamp: new Date(),
        value: 20,
        error: true,
      };
      output = summariseCounters([input])[0];
    });

    it("timestamp should match input", () => {
      expect(output.timestamp).toEqual(input.timestamp);
    });

    it("counters should contain single entry", () => {
      expect(output.counters).toHaveLength(1);
    });

    it("counter entry should match input", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { timestamp, ...expected } = input;
      expect(output.counters[0]).toEqual(expected);
    });
  });

  describe("multiple counters for same timestamp", () => {
    let timestamp: Date;
    let input: CounterEntry[];
    let output: SummarisedCounters[];

    beforeEach(() => {
      timestamp = new Date();
      input = [
        {
          name: "OpLo_GetSample",
          timestamp,
          value: 200,
        },
        {
          name: "ErLo_TransmitFail",
          timestamp,
          value: 20,
          error: true,
        },
      ];
      output = summariseCounters(input);
    });

    it("output should have one entry", () => {
      expect(output).toHaveLength(1);
    });

    it("entry should have two counters", () => {
      expect(output[0].counters).toHaveLength(2);
    });

    it("entry should have counter values", () => {
      expect(output[0].counters).toEqual([
        {
          name: "OpLo_GetSample",
          value: 200,
        },
        {
          name: "ErLo_TransmitFail",
          value: 20,
          error: true,
        },
      ]);
    });
  });
});
