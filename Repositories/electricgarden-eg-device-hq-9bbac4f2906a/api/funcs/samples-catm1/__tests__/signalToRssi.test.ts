import { signalToRssi } from "../signalToRssi";

/*
Table:
0:      -113 dBm or less
1:      -111 dBm
2..30:  -109 .. -53 dBm
31:     -51 dBm or greater
99:     not known or not detectable
*/
describe("signalToRssi", () => {
  describe("signalToRssi(undefined)", () => {
    it("should return undefined", () => {
      expect(signalToRssi(undefined)).toBeUndefined();
    });
  });

  describe.each([
    ["", undefined],
    ["abc", undefined],
    ["0", -113],
    ["1", -111],
    ["2", -109],
    ["31", -51],
    ["32", undefined],
  ])("signalToRssi('%s')", (input, expected) => {
    it(`returns ${expected}`, () => {
      expect(signalToRssi(input)).toBe(expected);
    });
  });
});
