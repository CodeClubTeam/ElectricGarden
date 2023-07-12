import { CounterDefinition, getCounterByType } from "../getCounterByType";

describe("getCounterByType", () => {
  let definition: CounterDefinition | undefined;

  const getCounter = (type: number) => (definition = getCounterByType(type));

  describe("type for Op_Wakeup (0x00 + 1)", () => {
    beforeEach(() => {
      getCounter(0x00 + 1);
    });

    it("should return value", () => {
      expect(definition).toBeDefined();
    });

    it("should return with name Op_Wakeup", () => {
      expect(definition?.name).toBe("Op_Wakeup");
    });

    it("should not be error counter", () => {
      expect(definition?.error).toBeFalsy();
    });
  });

  describe("type for Er_SaveSampleOverwritten (0xc0 + 0)", () => {
    beforeEach(() => {
      getCounter(0xc0 + 0);
    });

    it("should return value", () => {
      expect(definition).toBeDefined();
    });

    it("should return with name Er_SaveSampleOverwritten", () => {
      expect(definition?.name).toBe("Er_SaveSampleOverwritten");
    });

    it("should be error counter", () => {
      expect(definition?.error).toBe(true);
    });
  });

  describe("type not found 0x999", () => {
    it("should return name 'Unknown-0x999'", () => {
      expect(getCounter(0x999)).toHaveProperty("name", `Unknown-0x999`);
    });
  });
});
