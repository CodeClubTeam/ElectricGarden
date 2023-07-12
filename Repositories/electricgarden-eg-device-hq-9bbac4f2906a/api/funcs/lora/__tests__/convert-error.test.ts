/* eslint-disable camelcase */
import { ErrorsMessage } from "../../shared";
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

const SERIAL = "3HLL842";

const buildPayload = (payload_hex: string) => {
  const payload = { ...basePayload };
  payload.DevEUI_uplink.payload_hex = payload_hex;
  return payload;
};

describe("Error payload being converted", () => {
  let payload: ThingParkPayload;
  let result: ErrorsMessage;
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
    result = (messages as ErrorsMessage[])[0];
  };

  describe("payload with valid error message", () => {
    beforeEach(async () => {
      await runConvert(
        "04726164696f5f6c30312e7079226c696e653236696e706f77657275704e616d654572726f723a6e616d65757562696e617363696969736e6f74646566696e6564",
      );
    });

    it("returns correct serial", () => {
      expect(result.serial).toEqual("3HLL842");
    });

    it("returns correct message type", () => {
      expect(result.type).toEqual("error");
    });

    it("returns error content", () => {
      expect(result.content).toEqual({
        message: expect.anything(),
        traceback:
          'radio_l01.py"line26inpowerupNameError:nameuubinasciiisnotdefined',
      });
    });
  });
});
