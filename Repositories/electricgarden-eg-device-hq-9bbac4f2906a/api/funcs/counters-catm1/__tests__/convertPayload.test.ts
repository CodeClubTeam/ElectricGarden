import { convertPayload } from "../convertPayload";
import { CounterValue } from "../../shared";

describe("convertPayload", () => {
  let counters: CounterValue[];
  let encodingVersion: number;

  const runConvert = (payload: string) =>
    ({ counters, encodingVersion } = convertPayload(payload));

  describe("empty payload", () => {
    beforeEach(() => {
      runConvert("");
    });

    it("returns []", () => {
      expect(counters).toEqual([]);
    });
  });

  describe("one item payload", () => {
    beforeEach(() => {
      runConvert("01|01000023");
    });

    it("returns { 1, 35 }", () => {
      expect(counters).toEqual([{ type: 1, value: 35 }]);
    });

    it("returns encoding version of 1", () => {
      expect(encodingVersion).toBe(1);
    });
  });

  describe("multiple item payload", () => {
    beforeEach(() => {
      runConvert("01|01000023|0200004A");
    });

    it("second object returns { 2, 74 }", () => {
      expect(counters[1]).toEqual({ type: 2, value: 74 });
    });

    it("returns encoding version of 1", () => {
      expect(encodingVersion).toBe(1);
    });
  });

  describe("multiple item payload with one having wrong length", () => {
    beforeEach(() => {
      runConvert("01|01000023|0200004|0300004A");
    });

    it("second object returns { 3, 74 } as middle is skipped", () => {
      expect(counters[1]).toEqual({ type: 3, value: 74 });
    });

    it("returns encoding version of 1", () => {
      expect(encodingVersion).toBe(1);
    });
  });
});
