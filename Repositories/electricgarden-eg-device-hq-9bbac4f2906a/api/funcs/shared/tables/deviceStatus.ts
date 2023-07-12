import { Context } from "@azure/functions";
import {
  createTableService,
  deconstructTableServiceResult,
  isNotFoundError,
} from "./tableService";

// device status is really just a flag for catm1 to indicate "dirty" status i.e. instructions for device to fetch
type DeviceStatusRecord = {
  PartitionKey: string;
  RowKey: string;
  Serial: string;
  UpdatedOn: Date;
  UpdateAvailable: boolean;
};

const DEVICE_STATUS_TABLE_NAME = "devicestates";

const getDeviceStatusRecord = (
  log: Context["log"],
  serial: string,
): Promise<DeviceStatusRecord | undefined> => {
  const startTimeMs = Date.now();
  return new Promise((resolve, reject) =>
    createTableService().retrieveEntity(
      DEVICE_STATUS_TABLE_NAME,
      serial,
      serial,
      (err, record) => {
        log.info(
          `Device Status query for ${serial} took: ${
            Date.now() - startTimeMs
          }ms.`,
        );
        if (err) {
          if (isNotFoundError(err)) {
            return resolve(undefined);
          }
          log.error(`Error fetching device status for ${serial}: ${err}`);
          return reject(err);
        }
        log.info(`Success fetching device status for ${serial}.`);
        return resolve(
          deconstructTableServiceResult<DeviceStatusRecord>(record),
        );
      },
    ),
  );
};

export const getDeviceHasSettingsToUpdateFlag = async (
  log: Context["log"],
  serial: string,
): Promise<boolean> => {
  const deviceStatusRecord = await getDeviceStatusRecord(log, serial);
  return !!deviceStatusRecord && deviceStatusRecord.UpdateAvailable;
};

export const setDeviceHasSettingsToUpdateFlag = async (
  log: Context["log"],
  serial: string,
  flag: boolean,
) => {
  const tableService = createTableService();

  const record: DeviceStatusRecord = {
    PartitionKey: serial,
    RowKey: serial,
    Serial: serial,
    UpdatedOn: new Date(),
    UpdateAvailable: flag,
  };
  return new Promise((resolve, reject) =>
    tableService.insertOrMergeEntity(
      DEVICE_STATUS_TABLE_NAME,
      record,
      (err) => {
        if (err) {
          log.error(`Failed to upsert device status record`, record);
          reject(err);
        }
        log.info(`Success upserting device status`, record);
        resolve();
      },
    ),
  );
};
