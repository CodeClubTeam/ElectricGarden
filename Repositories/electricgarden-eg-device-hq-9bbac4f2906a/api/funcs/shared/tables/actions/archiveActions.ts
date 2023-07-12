import { Logger } from "@azure/functions";
import { createTableService } from "../tableService";
import { ACTIONS_TABLE_NAME } from "./constants";
import { getActionRecords } from "./getActionRecords";

export const archiveActions = async (log: Logger, serial: string) => {
  const actionRecords = await getActionRecords(log, serial);
  const tableService = createTableService();

  const archives = actionRecords.map((actionRecord) => {
    actionRecord.Archived = true;

    return new Promise((resolve, reject) =>
      tableService.replaceEntity(ACTIONS_TABLE_NAME, actionRecord, (err) => {
        if (err) {
          log.error(`Failed to archive action`, actionRecord);
          return reject(err);
        }
        log.info(`Success archiving action`, actionRecord);
        resolve();
      }),
    );
  });

  return Promise.all(archives);
};
