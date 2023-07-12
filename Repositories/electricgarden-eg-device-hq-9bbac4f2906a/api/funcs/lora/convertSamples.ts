import { decodeHexSample, Message, Sample } from "../shared";
import { createBootupMessage, createSampleMessage } from "./createMessage";
import { InvalidPayloadError } from "./errors";
import {
  GetSerialFromDeviceId,
  PayloadElements,
  RegisterDeviceMapping,
} from "./types";

const getValue = (value: string) => (value ? Number(value) : undefined);

export const convertLoRaV1 = async (
  { deviceId, snr, rssi, timestamp: timestampStr }: PayloadElements,
  rawData: string,
  registerDeviceMapping?: RegisterDeviceMapping,
): Promise<Message[]> => {
  const data = Buffer.from(rawData, "hex").toString();
  const split = data.split(":");
  const serial = split[0];
  if (serial.length !== 7) {
    throw new InvalidPayloadError("Invalid v1 sample layout");
  }

  if (registerDeviceMapping) {
    await registerDeviceMapping(deviceId, serial);
  }

  const receivedTimestampSeconds = Math.floor(Date.parse(timestampStr) / 1000);
  // then add offset based on sample count index thing (Joe?)
  const timestampOffsetSeconds = (Number(split[9]) || 0) * 1800;
  const timestampSeconds = receivedTimestampSeconds - timestampOffsetSeconds;
  const timestamp = new Date(timestampSeconds * 1000);

  const sample: Sample = {
    timestamp,

    probeSoilTemp: getValue(split[1]),
    probeAirTemp: getValue(split[2]),
    batteryVoltage: getValue(split[3]),
    ambientTemp: getValue(split[4]),
    probeMoisture: getValue(split[5]),

    // rssi is part of the body sent by thingpark
    rssi: rssi,

    light: getValue(split[6]),
    ambientHumidity: getValue(split[7]),

    // snr is also sent by thingpark
    snr: snr,

    errorCode: getValue(split[8]) || undefined,
  };

  return [
    createBootupMessage(serial, "", "", deviceId), // v1 will never send a bootup and we need to register so do on every sample
    createSampleMessage(serial, [sample]),
  ];
};

const getEntriesFromData = (data: string) => {
  const counterString = data.substring(2);
  const encodingVersion = parseInt(data.substring(0, 2), 16);
  let entries: string[] = [];
  if (encodingVersion === 1) {
    entries = counterString.split(/(.{32})/).filter((x) => x.length == 32);
  } else if (encodingVersion === 2) {
    entries = counterString.split(/(.{36})/).filter((x) => x.length == 36);
  }
  return entries;
};

export type MessagePayload = {
  serial: string;
  samples: Sample[];
};

export const convertLoRaV2 = async (
  elements: PayloadElements,
  data: string,
  getSerialFromDeviceId: GetSerialFromDeviceId,
) => {
  const entries = getEntriesFromData(data);
  const snr = elements.snr;
  const rssi = elements.rssi;
  const receivedTimestampSeconds = Math.floor(
    Date.parse(elements.timestamp) / 1000,
  );
  const samples: Sample[] = [];

  const serial = await getSerialFromDeviceId(elements.deviceId);

  for (const entry of entries) {
    const sampleRaw = decodeHexSample(entry);
    if (!sampleRaw) {
      continue;
    }
    const { offset, ...sample } = sampleRaw;
    const timestampSeconds = receivedTimestampSeconds - offset * 60;
    const timestamp = new Date(timestampSeconds * 1000);

    samples.push({
      ...sample,
      rssi,
      snr,
      timestamp,
    });
  }

  return [createSampleMessage(serial, samples)];
};
