export interface DeviceSettingsCommon {
  Wakeup: number;
  TransmitFreq: number;
  TransmitSize: number;
  MaxTransmits: number;
  MaxRetries: number;
  TimeFreq: number;
  CountersFreq: number;
  TimeSync: number;
  LocalMode: number;
  LocalFreq: number;
  LocalPeriod: number;
}

export type LoraDeviceSettings = DeviceSettingsCommon;

export interface Catm1DeviceSettings extends DeviceSettingsCommon {
  SamplesEp: string;
  CallHomeEp: string;
  InstructionEp: string;
  ErrorEp: string;
  CountersEp: string;
  DetachMode: number;
}

export type DeviceSettings = Catm1DeviceSettings & LoraDeviceSettings;
