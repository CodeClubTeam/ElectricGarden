import { decodeCounters } from "../decodeCounters";
import { CounterEntry, EncodedCounterEntry } from "../types";
import { getCounterByType } from "../getCounterByType";

describe("decodeCounters", () => {
  describe("empty", () => {
    it("returns []", () => {
      expect(decodeCounters([])).toEqual([]);
    });
  });

  describe("single value", () => {
    let input: EncodedCounterEntry;
    let output: CounterEntry;

    beforeEach(() => {
      input = {
        timestamp: new Date(),
        encodingVersion: 1,
        type: 0x00 + 0x00 + 3,
        value: 123,
      };
      output = decodeCounters([input])[0];

      it("timestamp should match input", () => {
        expect(output.timestamp).toBe(input.timestamp);
      });

      it("value should match input", () => {
        expect(output.value).toBe(input.value);
      });

      it("name should be converted from type", () => {
        expect(output.name).toBe(getCounterByType(input.type));
      });
    });
  });
});
