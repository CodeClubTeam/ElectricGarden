/* eslint prefer-const: 0 */ // --> OFF
import { Sample } from "../../shared";
import { convert } from "../convert";
import { signalToRssi } from "../signalToRssi";
import { SamplesWithSerial } from "../types";

type RawInput = {
  deviceRaw: string;
  timestampRaw: string;
  signalRaw?: string;
};

const buildPayloadFromRaw = (rawInput: RawInput[]) => {
  const payload = rawInput
    .map(({ deviceRaw, timestampRaw, signalRaw }) =>
      signalRaw
        ? `${deviceRaw};${timestampRaw};${signalRaw}`
        : `${deviceRaw};${timestampRaw}`,
    )
    .join("|");
  return payload;
};

interface DeviceData extends Omit<Sample, "timestamp" | "snr"> {
  serial: string;
}

type PropName = keyof Omit<DeviceData, "serial">;

const buildDeviceRaw = ({
  serial,
  ambientHumidity,
  ambientTemp,
  batteryVoltage,
  light,
  probeAirTemp,
  probeMoisture,
  probeSoilTemp,
  errorCode,
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
  if (errorCode !== undefined) {
    values.push(errorCode ?? 0);
  }
  return values.join(":");
};

const buildTimestampRaw = (timestamp?: string) => (timestamp ? timestamp : "");

const defaultTimestampInputStr = "18/09/14,13:08:30+52";
const defaultTimestampMilliseconds = Date.parse("2018-09-14T13:08:30+13:00");
const defaultTimestamp = new Date(defaultTimestampMilliseconds);

const buildSignalRaw = (signal?: string) => (signal ? signal : "");

const defaultSignal = "20";

type Input = {
  deviceData: DeviceData;
  timestamp?: string;
  signal?: string;
};

// turns human readable form into the encoded data used for transport
const buildPayload = (inputs: Input[]) => {
  const payload = buildPayloadFromRaw(
    inputs.map(
      ({ deviceData, timestamp, signal }): RawInput => {
        const result: RawInput = {
          deviceRaw: buildDeviceRaw(deviceData),
          timestampRaw: buildTimestampRaw(timestamp),
        };
        if (signal !== undefined) {
          result.signalRaw = buildSignalRaw(signal);
        }
        return result;
      },
    ),
  );
  return payload;
};

const normalizeTimestamp = (timestamp: Date) =>
  Math.floor(timestamp.getTime() / 1000);

const serial = "ABC456";

describe("catm1 convert (v1)", () => {
  let inputs: Input[];
  let payload: any;
  let result: SamplesWithSerial;

  const runConvert = (input: Input[]) => {
    payload = buildPayload(input);
    result = convert(payload);
  };

  const getFirstInputSerial = () => {
    return inputs[0].deviceData.serial;
  };

  const getFirstInputEntry = () => {
    return inputs[0];
  };

  const getFirstOutputEntry = () => {
    return result.samples[0];
  };

  beforeEach(() => {
    inputs = [
      {
        deviceData: {
          serial: "3HLL8DL",
          probeSoilTemp: 28.5,
          probeAirTemp: 28.3,
          batteryVoltage: 1.04,
          ambientTemp: 28.3,
          probeMoisture: 1.5,
          light: 63.5,
          ambientHumidity: 33.0,
        },
        timestamp: defaultTimestampInputStr,
        signal: defaultSignal,
      },
    ];
  });

  describe.only("received single entry payload", () => {
    beforeEach(() => {
      runConvert(inputs);
    });

    it("result matches snapshot", () => {
      expect(result).toMatchSnapshot("sample");
    });

    it("serial entry exists", () => {
      expect(result.serial).toBe(getFirstInputSerial());
    });

    it("only one sample", () => {
      expect(result.samples).toHaveLength(1);
    });

    it("values match device data", () => {
      const entry = getFirstOutputEntry();
      for (const [key, value] of Object.entries(
        getFirstInputEntry().deviceData,
      )) {
        if (["serial"].includes(key)) {
          continue;
        }
        if (entry[key as PropName] !== value) {
          console.log(key);
        }
        expect(entry[key as PropName]).toBe(value);
      }
    });

    it("timestamp matches input payload", () => {
      const { timestamp } = getFirstOutputEntry();
      expect(timestamp).toBeDefined();
      if (timestamp) {
        expect(normalizeTimestamp(timestamp)).toBe(
          normalizeTimestamp(defaultTimestamp),
        );
      }
    });
  });

  describe("received multi entry payload", () => {
    beforeEach(() => {
      inputs.push({
        deviceData: {
          serial,
        },
        timestamp: defaultTimestampInputStr,
      });
      inputs.push({
        deviceData: {
          serial,
        },
        timestamp: defaultTimestampInputStr,
      });
      runConvert(inputs);
    });

    it("serial entry exists for first", () => {
      expect(result.serial).toBe(serial);
    });

    it("entries combined so three samples", () => {
      expect(result.samples).toHaveLength(3);
    });
  });

  // describe.skip('with error code', () => {
  //   beforeEach(() => {
  //     deviceData.errorCode = 123;
  //     runConvert(deviceData);
  //   });

  //   it('result matches snapshot', () => {
  //     expect(result).toMatchSnapshot('with error code');
  //   });

  //   it('error code matches input', () => {
  //     expect(getFirstOutputEntry()[getOutputKey("errorCode")]).toBe(deviceData.errorCode?.toString());
  //   });
  // });

  describe("no timestamp", () => {
    beforeEach(() => {
      inputs[0].timestamp = undefined;
      runConvert(inputs);
    });

    it("undefined should be returned on timestamp property", () => {
      expect(result.samples[0].timestamp).toBeUndefined(); // not the job of convert to filter
    });
  });

  describe("signal", () => {
    describe("value of 20", () => {
      beforeEach(() => {
        inputs[0].signal = "20";
        runConvert(inputs);
      });

      it("rssi should be output of signalConvert", () => {
        expect(getFirstOutputEntry().rssi).toBe(signalToRssi("20"));
      });
    });

    describe("empty value", () => {
      beforeEach(() => {
        inputs[0].signal = "";
        runConvert(inputs);
      });

      it("rssi should be undefined", () => {
        expect(getFirstOutputEntry().rssi).toBeUndefined();
      });
    });

    describe("undefined value", () => {
      beforeEach(() => {
        delete inputs[0].signal;
        runConvert(inputs);
      });

      it("rssi should be undefined", () => {
        expect(getFirstOutputEntry().rssi).toBeUndefined();
      });
    });
  });

  describe("Given version 2 hex payloads", () => {
    describe("valid reading", () => {
      beforeEach(() => {
        let expectedReading =
          "3HLL8F8,19/12/06,13:44:26+52,20,01|0001000000b400c8028b00c8000f01ec";
        result = convert(expectedReading);
      });

      it("An array is returned", () => {
        expect(result).toBeDefined();
      });
      it('rssi should be defined and equal "-73"', () => {
        expect(getFirstOutputEntry().rssi).toBe("-73");
      });
      it('soil temp should be valid and equal to "20.0"', () => {
        expect(getFirstOutputEntry().probeSoilTemp).toBe("20.0");
      });
      it("timestamp should be defined", () => {
        expect(getFirstOutputEntry().timestamp).toBe(1575593066);
      });
    });

    describe("invalid reading", () => {
      beforeEach(() => {
        let invalidReading =
          "3HLL8F8,19/12/06,13:44:26+52,99,01|0001000000b400c8028b00c8000f01e";
        result = convert(invalidReading);
      });

      it("An undefined output is returned", () => {
        expect(getFirstOutputEntry()).toBeUndefined();
      });
    });

    describe("missed reading (0x8000 value)", () => {
      beforeEach(() => {
        let missedReading =
          "3HLL8F8,19/12/06,13:44:26+52,20,01|0001000000b48000028b00c8000f01ec";
        result = convert(missedReading);
      });

      it("Undefined returned for amb temp", () => {
        expect(getFirstOutputEntry().ambientTemp).toBeUndefined();
      });

      it("A correct value is returned for soil temp", () => {
        expect(getFirstOutputEntry().probeSoilTemp).toBe("20.0");
      });
    });
  });
});
