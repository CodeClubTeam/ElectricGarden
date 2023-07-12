import { DeviceInfo } from "../../records";

export type DeviceInfoRecord = DeviceInfo & {
  PartitionKey: string;
  RowKey: string;
  Timestamp?: string;
};

export const mapRecordToInfo = ({
  serial,
  type,
  appSamplesEndpointOverride,
  externalDeviceId,
  firmwareVersion,
  hardwareVersion,
  trelloCardId,
  Timestamp,
}: DeviceInfoRecord): DeviceInfo => ({
  serial,
  type,
  appSamplesEndpointOverride,
  externalDeviceId,
  firmwareVersion,
  hardwareVersion,
  trelloCardId,
  updatedOn: Timestamp ? new Date(Timestamp) : undefined,
});
