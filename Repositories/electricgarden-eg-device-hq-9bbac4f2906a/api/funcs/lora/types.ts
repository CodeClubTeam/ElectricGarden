// generated from an example payload

export interface ThingParkPayload {
  DevEUI_uplink: DevEUIuplink;
}

interface DevEUIuplink {
  Time: string;
  DevEUI: string;
  payload_hex: string;
  LrrRSSI: number;
  LrrSNR: number;
}

export type PayloadElements = {
  rssi: DevEUIuplink["LrrRSSI"];
  snr: DevEUIuplink["LrrSNR"];
  timestamp: DevEUIuplink["Time"];
  deviceId: DevEUIuplink["DevEUI"];
};

export type PayloadElementsFull = PayloadElements & {
  rawData: DevEUIuplink["payload_hex"];
};

export type RegisterDeviceMapping = (
  loraDeviceId: string,
  serial: string,
) => Promise<void>;

export type GetSerialFromDeviceId = (loraDeviceId: string) => Promise<string>;
