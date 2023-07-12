export interface DeviceInfo {
  serial: string;
  type: "lora" | "catm1";
  firmwareVersion?: string;
  hardwareVersion?: string;
  externalDeviceId?: string;
  appSamplesEndpointOverride?: string;
  updatedOn?: Date;
  trelloCardId?: string;
}

export type DeviceType = DeviceInfo["type"];
