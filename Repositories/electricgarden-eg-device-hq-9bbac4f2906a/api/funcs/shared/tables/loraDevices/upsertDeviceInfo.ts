import { Logger } from "@azure/functions";
import { createTableService } from "../tableService";
import {
  LoraDevice,
  LoraDeviceRecord,
  LORA_DEVICES_TABLE_NAME,
} from "./shared";

export const upsertLoraDevice = async (log: Logger, info: LoraDevice) => {
  const tableService = createTableService();

  const { loraDeviceId, serial } = info;

  const record: LoraDeviceRecord = {
    PartitionKey: loraDeviceId,
    RowKey: loraDeviceId,
    loraDeviceId,
    serial,
  };

  return new Promise((resolve, reject) =>
    tableService.insertOrReplaceEntity(
      LORA_DEVICES_TABLE_NAME,
      record,
      (err) => {
        if (err) {
          log.error(`Failed to upsert lora device`, record);
          return reject(err);
        }
        log.info(`Success upserting lora device`, record);
        resolve();
      },
    ),
  );
};
