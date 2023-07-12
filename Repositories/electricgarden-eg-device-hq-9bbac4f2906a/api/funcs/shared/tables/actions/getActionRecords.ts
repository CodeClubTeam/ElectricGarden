import { Logger } from "@azure/functions";
import azure from "azure-storage";
import { ActionRecord } from "../../records";
import {
  createTableService,
  deconstructTableServiceResult,
} from "../tableService";
import { ACTIONS_TABLE_NAME } from "./constants";

export type GetActionRecords = (
  log: Logger,
  serial: string,
) => Promise<ActionRecord[]>;

export const getActionRecords: GetActionRecords = (log, serial) => {
  const query = new azure.TableQuery()
    .where("PartitionKey eq ?", serial)
    .and("Serial eq ?", serial)
    .and("Archived eq ?", false);

  const nextContinuationToken: any = null; // don't expect to need this
  return new Promise((resolve, reject) =>
    createTableService().queryEntities<ActionRecord>(
      ACTIONS_TABLE_NAME,
      query,
      nextContinuationToken,
      (err, result) => {
        if (err) {
          log.error(`Error fetching actions for ${serial}: ${err}`);
          return reject(err);
        }
        log.info(`Success fetching actions for ${serial}.`);

        resolve(
          result.entries.map((entry) =>
            deconstructTableServiceResult<ActionRecord>(entry),
          ),
        );
      },
    ),
  );
};
