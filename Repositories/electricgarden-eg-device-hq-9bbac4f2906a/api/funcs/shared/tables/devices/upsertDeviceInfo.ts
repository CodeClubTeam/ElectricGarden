import { Logger } from "@azure/functions";
import { createTableService } from "../tableService";
import { DEVICES_TABLE_NAME } from "./constants";
import { DeviceInfoRecord } from "./record";
import { DeviceInfo } from "../../records";

export const upsertDevice = async (log: Logger, info: DeviceInfo) => {
  const tableService = createTableService();

  const { serial } = info;

  const record: DeviceInfoRecord = {
    PartitionKey: serial,
    RowKey: serial,
    ...info,
  };

  return new Promise((resolve, reject) =>
    tableService.insertOrMergeEntity(DEVICES_TABLE_NAME, record, (err) => {
      if (err) {
        log.error(`Failed to upsert device`, record);
        return reject(err);
      }
      log.info(`Success upserting device`, record);
      resolve();
    }),
  );
};
