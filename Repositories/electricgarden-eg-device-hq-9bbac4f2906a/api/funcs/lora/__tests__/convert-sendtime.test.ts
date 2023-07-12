/* eslint-disable camelcase */
import { SendTimeMessage } from "../../shared";
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

describe("convert sendtime", () => {
  let payload: ThingParkPayload;
  let result: SendTimeMessage;

  const runConvert = async (payload_hex: string) => {
    payload = buildPayload(payload_hex);
    const messages = await convert(payload, options);
    result = (messages as SendTimeMessage[])[0];
  };

  describe("payload with valid message", () => {
    beforeEach(async () => {
      await runConvert("0633484c4c3834320022");
    });

    it("returns correct serial", () => {
      expect(result.serial).toEqual("3HLL842");
    });

    it("returns correct content", () => {
      expect(result.content).toEqual({
        deviceId: basePayload.DevEUI_uplink.DevEUI,
        offsets: {
          device: 34,
          received: 869,
        },
      });
    });
  });

  describe("invalid payload", () => {
    it("Should throw error", async () => {
      await expect(runConvert("0633484c4c38343222141")).rejects.toThrow();
    });
  });
});
