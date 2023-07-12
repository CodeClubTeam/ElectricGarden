import { Logger } from "@azure/functions";
import { getActionRecords } from "./getActionRecords";
import { ACTIONS_TABLE_NAME } from "./constants";
import { createTableService } from "../tableService";
import { ActionRecord } from "../../records";

export const deleteActions = async (log: Logger, serial: string) => {
  const actionRecords = await getActionRecords(log, serial);
  const tableService = createTableService();

  const deletes = actionRecords.map((actionRecord) => {
    const { PartitionKey, RowKey } = actionRecord;
    const identifier: Partial<ActionRecord> = {
      PartitionKey,
      RowKey,
    };

    return new Promise((resolve, reject) =>
      tableService.deleteEntity(ACTIONS_TABLE_NAME, identifier, (err) => {
        if (err) {
          log.error(`Failed to delete action`, actionRecord);
          return reject(err);
        }
        log.info(`Success deleting action`, actionRecord);
        resolve();
      }),
    );
  });

  return Promise.all(deletes);
};
