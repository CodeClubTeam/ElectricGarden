/* eslint-disable camelcase */
import { CountersMessage } from "../../shared";
import { convert } from "../convert";
import { GetSerialFromDeviceId, ThingParkPayload } from "../types";

const basePayload: ThingParkPayload = {
  DevEUI_uplink: {
    Time: "2019-01-21T01:29:57.606+00:00",
    DevEUI: "70B3D5499D5D832B",
    payload_hex: "",
    LrrRSSI: -113,
    LrrSNR: -7,
  },
};

const buildPayload = (payload_hex: string) => {
  const payload = { ...basePayload };
  payload.DevEUI_uplink.payload_hex = payload_hex;
  return payload;
};

const SERIAL = "3HLL842";

describe("Counter payload being converted", () => {
  let payload: ThingParkPayload;
  let result: CountersMessage;
  let serialByDeviceId: Record<string, string>;
  let options: Parameters<typeof convert>[1];

  beforeAll(() => {
    serialByDeviceId = {};
    const getSerialFromDeviceId: GetSerialFromDeviceId = async (id) => {
      const serial = serialByDeviceId[id];
      if (!serial) {
        throw new Error(`Device id not found: ${id}.`);
      }
      return serial;
    };
    options = {
      getSerialFromDeviceId,
    };
  });

  const runConvert = async (payload_hex: string) => {
    payload = buildPayload(payload_hex);
    serialByDeviceId[basePayload.DevEUI_uplink.DevEUI] = SERIAL;
    const messages = await convert(payload, options);
    result = (messages as CountersMessage[])[0];
  };

  describe("payload with no counters", () => {
    beforeEach(async () => {
      await runConvert("0301");
    });

    it("returns correct serial", () => {
      expect(result.serial).toEqual(SERIAL);
    });

    it("returns empty content", () => {
      expect(result.content.values).toEqual([]);
    });
  });

  describe("invalid payload", () => {
    it("Should throw error", async () => {
      await expect(runConvert("0301c70000")).rejects.toThrow();
    });
  });

  describe("one item payload", () => {
    beforeEach(async () => {
      await runConvert("03018b01");
    });

    it("returns one counter type value pair", () => {
      expect(result.content.values).toEqual([{ type: 139, value: 1 }]);
    });

    it("return message type of counters", () => {
      expect(result.type).toBe("counters");
    });
  });

  describe("multi item payload", () => {
    beforeEach(async () => {
      await runConvert(
        "030101038b01020203020402070108010f01100114011c021e014401600ec101490112011301",
      );
    });

    it("returns { 1, 35 }", () => {
      expect(result.content.values[4]).toEqual({ type: 4, value: 2 });
    });

    it("return serial number correctly", () => {
      expect(result.serial).toBe("3HLL842");
    });
  });
});
