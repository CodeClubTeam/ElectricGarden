import { decodeHexSample } from "../../shared/samples/decodeHexSample";

describe("decodeHexSample", () => {
  describe("decodeHexSample(undefined)", () => {
    it("should return undefined", () => {
      expect(() => {
        decodeHexSample(undefined);
      }).toThrow();
    });
  });

  describe("Given an actual reading", () => {
    const payload = "0001000000b400c8028b00c8000f01ec";

    let result: ReturnType<typeof decodeHexSample>;

    describe("valid reading", () => {
      beforeEach(() => {
        result = decodeHexSample(payload);
      });

      it("A correct soil temp is returned", () => {
        expect(result?.probeSoilTemp).toBe(20.0);
      });

      it("A correct ambient humidity is returned", () => {
        expect(result?.ambientHumidity).toBe(65.1);
      });

      it("A correct ambient temp is returned", () => {
        expect(result?.ambientTemp).toBe(20.0);
      });

      it("A correct battery voltage is returned", () => {
        expect(result?.batteryVoltage).toBe(4.92);
      });

      it("A correct light value is returned", () => {
        expect(result?.light).toBe(180.0);
      });

      it("A correct soil moisture is returned", () => {
        expect(result?.probeMoisture).toBe(1.5);
      });

      it("A correct time offset is returned", () => {
        expect(result?.offset).toBe(0);
      });

      it("probe soil temp matches ambient air temp", () => {
        expect(result?.probeAirTemp).toBe(result?.ambientTemp);
      });

      it("offset should be 0", () => {
        expect(result?.offset).toBe(0);
      });
    });
  });
});
