/* eslint-disable camelcase */
import { BootupMessage } from "../../shared";
import { convert } from "../convert";
import { GetSerialFromDeviceId, ThingParkPayload } from "../types";

const getSerialFromDeviceId: GetSerialFromDeviceId = jest.fn();

const options: Parameters<typeof convert>[1] = {
  getSerialFromDeviceId,
};

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

describe("Bootup payload being converted", () => {
  let payload: ThingParkPayload;
  let result: BootupMessage;

  const runConvert = async (payload_hex: string) => {
    payload = buildPayload(payload_hex);
    const messages = await convert(payload, options);
    result = (messages as BootupMessage[])[0];
  };

  describe("payload with valid call home message", () => {
    beforeEach(async () => {
      await runConvert("0133484c4c383432221403a5");
    });

    it("returns correct serial", () => {
      expect(result.serial).toEqual("3HLL842");
    });

    it("returns bootup content", () => {
      expect(result.content).toEqual({
        deviceType: "lora",
        firmware: "3.4",
        hardware: "2.0",
        externalId: basePayload.DevEUI_uplink.DevEUI,
        timeSync: {
          device: 933,
          clock: 869,
        },
      });
    });
  });

  describe("invalid payload", () => {
    it("Should throw error", async () => {
      await expect(runConvert("0133484c4c38343222141")).rejects.toThrow();
    });
  });
});
