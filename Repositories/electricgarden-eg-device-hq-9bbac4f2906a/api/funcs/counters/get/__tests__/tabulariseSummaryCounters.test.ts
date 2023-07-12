import { SummarisedCounter, SummarisedCounters } from "../summariseCounters";
import {
  TabularisedSummaryCounters,
  tabulariseSummaryCounters,
} from "../tabulariseSummaryCounters";

describe("tabularised summary counters", () => {
  let output: TabularisedSummaryCounters;

  const headerRow = () => output[0];

  const valueRows = () => output.slice(1);

  const firstRow = () => valueRows()[0];

  describe("with empty", () => {
    it("should return empty", () => {
      expect(tabulariseSummaryCounters([])).toEqual([]);
    });
  });

  describe("with no counters for timestamp", () => {
    it("should return header row with just timestamp and timestamp column", () => {
      const timestamp = new Date();
      expect(tabulariseSummaryCounters([{ timestamp, counters: [] }])).toEqual([
        ["Timestamp"],
        [timestamp.toISOString()],
      ]);
    });
  });

  describe("with counters for single timestamp", () => {
    let timestamp: Date;
    let counters: SummarisedCounter[];

    beforeEach(() => {
      timestamp = new Date();
      counters = [
        { name: "abc", value: 12 },
        { name: "def", value: 100 },
      ];
      output = tabulariseSummaryCounters([{ timestamp, counters }]);
    });

    it("should return header row with timestamp and all columns", () => {
      expect(headerRow()).toEqual(["Timestamp", "abc", "def"]);
    });

    it("should return timestamp as ISO string", () => {
      expect(valueRows()[0][0]).toEqual(timestamp.toISOString());
    });

    it("should return counters as column values", () => {
      expect(firstRow().slice(1)).toEqual([12, 100]);
    });
  });

  describe("with mix of counters for multiple timestamps", () => {
    const input: SummarisedCounters[] = [
      {
        timestamp: new Date(),
        counters: [
          { name: "abc", value: 12 },
          { name: "def", value: 100 },
        ],
      },
      {
        timestamp: new Date("2020-04-20T21:55:09.611Z"),
        counters: [
          { name: "abc", value: 13 },
          { name: "hij", value: 97 },
        ],
      },
    ];

    beforeEach(() => {
      output = tabulariseSummaryCounters(input);
    });

    it("should return matching timestamps", () => {
      expect(valueRows().map((e) => e[0])).toEqual(
        input.map((e) => e.timestamp.toISOString()),
      );
    });

    it("should return column for all counter names from both sets", () => {
      expect(headerRow().slice(1)).toEqual(["abc", "def", "hij"]);
    });

    it("should return expected value rows", () => {
      expect(valueRows()).toEqual([
        [input[0].timestamp.toISOString(), 12, 100, ""],
        [input[1].timestamp.toISOString(), 13, "", 97],
      ]);
    });

    describe("with rotate", () => {
      beforeEach(() => {
        output = tabulariseSummaryCounters(input, { rotated: true });
      });

      it("should return expected rows", () => {
        expect(output).toEqual([
          [
            "Timestamp",
            input[0].timestamp.toISOString(),
            input[1].timestamp.toISOString(),
          ],
          ["abc", 12, 13],
          ["def", 100, ""],
          ["hij", "", 97],
        ]);
      });
    });
  });
});
