export type DeviceType = "lora" | "catm1";

export type DeviceStatus = "active" | "inactive" | undefined;

export interface DeviceInfo {
  serial: string;
  type: "lora" | "catm1";
  firmwareVersion: string;
  hardwareVersion: string;
  externalDeviceId?: string;
  appSamplesEndpointOverride?: string;
  updatedOn: Date;
  lastReceived?: Date;
}
