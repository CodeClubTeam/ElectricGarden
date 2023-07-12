export const LORA_DEVICES_TABLE_NAME = "loradevices";

export interface LoraDevice {
  loraDeviceId: string;
  serial: string;
}

export interface LoraDeviceRecord extends LoraDevice {
  PartitionKey: string;
  RowKey: string;
}
