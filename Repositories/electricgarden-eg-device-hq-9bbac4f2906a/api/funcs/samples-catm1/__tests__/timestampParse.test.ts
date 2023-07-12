import { timestampParse } from "../timestampParse";

describe("Timestamp parser", () => {
  it("empty string converts to undefined", () => {
    expect(() => {
      timestampParse("");
    }).toThrow();
  });

  describe("Given an actual timestamp", () => {
    let result: Date | undefined;
    let expectedResult: Date;

    describe("valid timestamp", () => {
      beforeEach(() => {
        result = timestampParse("18/09/14,13:08:29+52");
        expectedResult = new Date("2018-09-14T13:08:29+13:00");
      });

      it("A Date is returned", () => {
        expect(result).toBeDefined();
      });

      it("Year is parsed correctly", () => {
        expect(result?.getFullYear()).toBe(expectedResult.getFullYear());
      });

      it("Month is parsed correctly", () => {
        expect(result?.getMonth()).toBe(expectedResult.getMonth());
      });

      it("Day is parsed correctly", () => {
        expect(result?.getDay()).toBe(expectedResult.getDay());
      });

      it("Hours are parsed correctly", () => {
        expect(result?.getHours()).toBe(expectedResult.getHours());
      });

      it("Minutes are parsed correctly", () => {
        expect(result?.getMinutes()).toBe(expectedResult.getMinutes());
      });

      it("Seconds are parsed correctly", () => {
        expect(result?.getSeconds()).toBe(expectedResult.getSeconds());
      });

      it("Timezone offset is parsed correctly", () => {
        expect(result?.getTimezoneOffset()).toBe(
          expectedResult.getTimezoneOffset(),
        );
      });
    });

    describe("timestamp only has day and month", () => {
      it("should return undefined", () => {
        expect(() => {
          timestampParse("18/09");
        }).toThrow();
      });
    });

    describe("timestamp has non-numeric year", () => {
      it("should return undefined", () => {
        expect(() => {
          timestampParse("dd/09/14,13:08:29+52");
        }).toThrow();
      });
    });
  });
});
