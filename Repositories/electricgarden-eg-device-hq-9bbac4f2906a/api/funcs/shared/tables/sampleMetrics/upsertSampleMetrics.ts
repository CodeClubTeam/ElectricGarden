import { Logger } from "@azure/functions";
import { SampleMessage } from "../../messages";
import { createTableService } from "../tableService";
import { SAMPLE_METRICS_TABLE_NAME } from "./constants";
import { mapSampleMessageToInfo } from "./record";

export const upsertSampleMetrics = async (
  log: Logger,
  message: SampleMessage,
) => {
  const tableService = createTableService();

  const record = mapSampleMessageToInfo(message);

  return new Promise((resolve, reject) =>
    tableService.insertOrMergeEntity(
      SAMPLE_METRICS_TABLE_NAME,
      record,
      (err) => {
        if (err) {
          log.error(`Failed to upsert sample metrics`, record);
          return reject(err);
        }
        log.info(`Success upserting sample metrics`, record);
        resolve();
      },
    ),
  );
};
