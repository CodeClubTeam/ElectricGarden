import { Message } from "../shared";
import { convertBootup } from "./convertBootup";
import { convertCounters } from "./convertCounters";
import { convertError } from "./convertError";
import { convertLoRaV1, convertLoRaV2 } from "./convertSamples";
import { convertSendTime } from "./convertSendTime";
import {
  GetSerialFromDeviceId,
  PayloadElements,
  PayloadElementsFull,
  RegisterDeviceMapping,
  ThingParkPayload,
} from "./types";

export const extractPayloadElements = (
  payload: ThingParkPayload,
): PayloadElementsFull => ({
  rawData: payload.DevEUI_uplink.payload_hex,
  rssi: payload.DevEUI_uplink.LrrRSSI,
  snr: payload.DevEUI_uplink.LrrSNR,
  timestamp: payload.DevEUI_uplink.Time,
  deviceId: payload.DevEUI_uplink.DevEUI,
});

enum PayloadType {
  PING = 0,
  BOOTUP = 1,
  SAMPLE = 2,
  COUNTER = 3,
  ERROR = 4,
  TIME = 6,
}

const getMessages = async (
  elements: PayloadElements,
  type: PayloadType, // replace with enum
  payload: string,
  { registerDeviceMapping, getSerialFromDeviceId }: ConvertOptions,
): Promise<Message[]> => {
  if (type === PayloadType.PING) {
    // Message contains ADR workaround ping, no messages needed
    return [];
  }
  if (type === PayloadType.BOOTUP) {
    // Message contains bootup info
    return convertBootup(elements, payload, registerDeviceMapping);
  }
  if (type === PayloadType.SAMPLE) {
    // Message contains samples
    return convertLoRaV2(elements, payload, getSerialFromDeviceId);
  }
  if (type === PayloadType.COUNTER) {
    // Message contains counters
    return convertCounters(elements, payload, getSerialFromDeviceId);
  }
  if (type === PayloadType.ERROR) {
    // Message contains errors
    return convertError(elements, payload, getSerialFromDeviceId);
  }
  if (type === PayloadType.TIME) {
    // Message contains time request
    return convertSendTime(elements, payload, registerDeviceMapping);
  }
  // No byte prefix of 1, 2 or 3
  // so assume original sample payload
  return convertLoRaV1(elements, payload, registerDeviceMapping);
};

interface ConvertOptions {
  registerDeviceMapping?: RegisterDeviceMapping;
  getSerialFromDeviceId: GetSerialFromDeviceId;
}

interface UnpackPayloadForRoute {
  type: number; // replace with enum
  payload: string;
}

export const unpackRawData = (rawData: string): UnpackPayloadForRoute => {
  const type = parseInt(rawData.substring(0, 2), 16);
  const payload = rawData.substring(2);
  // non header e.g. 9
  if (type > 9) {
    return {
      type: 9,
      payload: rawData,
    };
  }
  return {
    type,
    payload,
  };
};

export const convert = async (
  rawPayload: ThingParkPayload,
  options: ConvertOptions,
) => {
  const { rawData, ...elements } = extractPayloadElements(rawPayload);
  const { type, payload } = unpackRawData(rawData);
  return getMessages(elements, type, payload, options);
};
