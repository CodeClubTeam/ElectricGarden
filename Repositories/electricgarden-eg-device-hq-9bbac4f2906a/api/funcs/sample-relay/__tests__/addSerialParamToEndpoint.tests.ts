import { addSerialParamToEndpoint } from "../addSerialParamToEndpoint";

describe("addSerialParamToEndpoint", () => {
  describe("endpoint has query string", () => {
    it("should insert before query string", () => {
      expect(
        addSerialParamToEndpoint(
          "https://egingestprod.azurewebsites.net/api/samples/v1/{serial}?code=aQe4vNtSTL0lLs6iqa04Oj1pMHw/u/rSaPFZ06YaYeCal0fY4gmCXw==",
          "ABC123",
        ),
      ).toBe(
        "https://egingestprod.azurewebsites.net/api/samples/v1/ABC123?code=aQe4vNtSTL0lLs6iqa04Oj1pMHw/u/rSaPFZ06YaYeCal0fY4gmCXw==",
      );
    });
  });

  describe("endpoint has no query string", () => {
    it("should append to endpoint", () => {
      expect(
        addSerialParamToEndpoint(
          "https://egingestprod.azurewebsites.net/api/samples/v1/{serial}",
          "ABC123",
        ),
      ).toBe("https://egingestprod.azurewebsites.net/api/samples/v1/ABC123");
    });
  });

  describe("endpoint has no {serial}", () => {
    it("should error", () => {
      expect(() =>
        addSerialParamToEndpoint(
          "http://egingestprod.azurewebsites.net/api/samples/v1",
          "ABC123",
        ),
      ).toThrow();
    });
  });
});
