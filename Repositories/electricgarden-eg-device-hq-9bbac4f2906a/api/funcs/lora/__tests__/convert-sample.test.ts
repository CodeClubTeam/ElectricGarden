/* eslint-disable camelcase */
import { Sample, SampleMessage } from "../../shared";
import { convert } from "../convert";
import { GetSerialFromDeviceId, ThingParkPayload } from "../types";

const basePayload: ThingParkPayload = {
  DevEUI_uplink: {
    Time: "2019-01-21T01:29:57.606+00:00",
    DevEUI: "70B3D5499D5D832B",
    payload_hex:
      "0202000300000043800080008000800001eb0190000300000043800080008000800001eb0190",
    LrrRSSI: -113,
    LrrSNR: -7,
  },
};

const buildPayload = (deviceDataHex: string, timestamp?: Date) => {
  const payload = { ...basePayload };
  payload.DevEUI_uplink.payload_hex = Buffer.from(deviceDataHex).toString(
    "hex",
  );
  if (timestamp) {
    payload.DevEUI_uplink.Time = timestamp.toISOString();
  }
  return payload;
};

interface DeviceData extends Omit<Sample, "timestamp" | "rssi" | "snr"> {
  serial: string;
  readingNumberOffset?: number;
}

type ReadingKey = keyof Sample;

const buildDevicePayload = ({
  serial,
  ambientHumidity,
  ambientTemp,
  batteryVoltage,
  light,
  probeAirTemp,
  probeMoisture,
  probeSoilTemp,
  errorCode,
  readingNumberOffset,
}: DeviceData) => {
  const values = [
    serial,
    probeSoilTemp,
    probeAirTemp,
    batteryVoltage,
    ambientTemp,
    probeMoisture,
    light,
    ambientHumidity,
  ];
  if (errorCode !== undefined || readingNumberOffset !== undefined) {
    values.push(errorCode ?? 0);
  }
  if (readingNumberOffset !== undefined) {
    values.push(readingNumberOffset ?? 0);
  }
  return values.join(":");
};

const normalizeTimestamp = (timestamp: Date) =>
  Math.floor(timestamp.getTime() / 1000);

describe("lora convert: sample", () => {
  let payload: any;
  let result: SampleMessage;
  let resultv2: SampleMessage;
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

  const runConvert = async (deviceData: DeviceData) => {
    payload = buildPayload(buildDevicePayload(deviceData));
    serialByDeviceId[basePayload.DevEUI_uplink.DevEUI] = deviceData.serial;
    const messages = await convert(payload, options);
    result = (messages as SampleMessage[])[1];
  };

  const getOutputEntry = (result: SampleMessage) => {
    return result.content[0];
  };

  const deviceDataV2: DeviceData = {
    serial: "3HLL8DL",
    probeSoilTemp: undefined,
    probeAirTemp: undefined,
    batteryVoltage: 4.91,
    ambientTemp: undefined,
    probeMoisture: undefined,
    light: 67,
    co2: 400,
    ambientHumidity: undefined,
  };

  describe("v2 payload", () => {
    const SERIAL = "3HLL842";

    beforeAll(async () => {
      serialByDeviceId[basePayload.DevEUI_uplink.DevEUI] = SERIAL;
      const messages = await convert(basePayload, options);
      resultv2 = (messages as SampleMessage[])[0];
    });

    it("serial matches exists", () => {
      expect(resultv2.serial).toEqual(SERIAL);
    });

    it("values match device data", () => {
      const entry = getOutputEntry(resultv2);
      for (const [key, value] of Object.entries(deviceDataV2)) {
        if (["serial", "readingNumberOffset"].includes(key)) {
          continue;
        }
        expect(entry[key as ReadingKey]).toBe(value);
      }
    });

    it("timestamp matches input payload", () => {
      expect(normalizeTimestamp(getOutputEntry(resultv2).timestamp)).toEqual(
        normalizeTimestamp(new Date(basePayload.DevEUI_uplink.Time)),
      );
    });

    it("rssi matches input payload", () => {
      expect(getOutputEntry(resultv2).rssi).toBe(
        basePayload.DevEUI_uplink.LrrRSSI,
      );
    });

    it("snr matches input payload", () => {
      expect(getOutputEntry(resultv2).snr).toBe(
        basePayload.DevEUI_uplink.LrrSNR,
      );
    });
  });

  const deviceDataV1: DeviceData = {
    serial: "3HLL8DL",
    probeSoilTemp: 28.5,
    probeAirTemp: 28.3,
    batteryVoltage: 1.04,
    ambientTemp: 28.3,
    probeMoisture: 1.5,
    light: 63.5,
    ambientHumidity: 33.0,
  };

  describe("v1 payload", () => {
    beforeAll(async () => {
      await runConvert(deviceDataV1);
    });

    it("serial matches exists", () => {
      expect(result.serial).toEqual(deviceDataV1.serial);
    });

    it("values match device data", () => {
      const entry = getOutputEntry(result);
      for (const [key, value] of Object.entries(deviceDataV1)) {
        if (["serial", "readingNumberOffset"].includes(key)) {
          continue;
        }
        expect(entry[key as ReadingKey]).toBe(value);
      }
    });

    it("timestamp matches input payload", () => {
      expect(normalizeTimestamp(getOutputEntry(result).timestamp)).toEqual(
        normalizeTimestamp(new Date(payload.DevEUI_uplink.Time)),
      );
    });

    it("rssi matches input payload", () => {
      expect(getOutputEntry(result).rssi).toBe(payload.DevEUI_uplink.LrrRSSI);
    });

    it("snr matches input payload", () => {
      expect(getOutputEntry(result).snr).toBe(payload.DevEUI_uplink.LrrSNR);
    });
  });

  describe("with error code", () => {
    beforeAll(async () => {
      deviceDataV1.errorCode = 123;
      await runConvert(deviceDataV1);
    });

    it("error code matches input", () => {
      expect(getOutputEntry(result).errorCode).toBe(deviceDataV1.errorCode);
    });
  });

  describe("with reading number offset", () => {
    beforeAll(async () => {
      deviceDataV1.readingNumberOffset = 3;
      await runConvert(deviceDataV1);
    });

    it("output timestamp offset by 30min x readingNumberOffset", () => {
      const TIME_BETWEEN_READINGS_MS = 30 * 60 * 1000; // 30 minutes
      const timestampMilliseconds = Date.parse(payload.DevEUI_uplink.Time);
      const offsetMilliseconds =
        (deviceDataV1.readingNumberOffset ?? 0) * TIME_BETWEEN_READINGS_MS;
      const expectedTimestamp = new Date(
        timestampMilliseconds - offsetMilliseconds,
      );

      expect(normalizeTimestamp(getOutputEntry(result).timestamp)).toBe(
        normalizeTimestamp(expectedTimestamp),
      );
    });
  });
});
