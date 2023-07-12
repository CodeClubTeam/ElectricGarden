import { Logger } from "@azure/functions";
import { CounterRecord } from "../../../shared";
import { createTableService } from "../tableService";
import { COUNTERS_TABLE_NAME } from "./constants";
import { queryCounters } from "./queryCounters";

export const deleteCounters = async (log: Logger, serial: string) => {
  const records = await queryCounters(log, serial);
  const tableService = createTableService();

  const deletes = records.map((record) => {
    const { PartitionKey, RowKey } = record;
    const identifier: Partial<CounterRecord> = {
      PartitionKey,
      RowKey,
    };

    return new Promise((resolve, reject) =>
      tableService.deleteEntity(COUNTERS_TABLE_NAME, identifier, (err) => {
        if (err) {
          log.error(`Failed to delete counter record`, record);
          return reject(err);
        }
        resolve();
      }),
    );
  });

  return Promise.all(deletes);
};
