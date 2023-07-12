import { Logger } from "@azure/functions";
import azure from "azure-storage";
import {
  createTableService,
  deconstructTableServiceResult,
} from "../tableService";
import { CounterRecord } from "../../records";
import { COUNTERS_TABLE_NAME } from "./constants";

type RawRecord = Omit<CounterRecord, "Timestamp"> & {
  Timestamp: string;
  ["odata.etag"]: string;
};

export type Criteria = {
  // filter date range?
};

export type QueryCounters = (
  log: Logger,
  serial: string,
  criteria?: Criteria,
) => Promise<CounterRecord[]>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const queryCounters: QueryCounters = async (
  log,
  serial,
  criteria = {},
) => {
  const query = new azure.TableQuery()
    .where("PartitionKey eq ?", serial)
    .and("Serial eq ?", serial);

  let pageNumber = 1;
  let nextContinuationToken: any = null;
  const results: CounterRecord[] = [];

  while (pageNumber === 1 || nextContinuationToken !== null) {
    log.info(`Fetching page ${pageNumber}.`);
    const pageResults = await new Promise<CounterRecord[]>((resolve, reject) =>
      createTableService().queryEntities<RawRecord>(
        COUNTERS_TABLE_NAME,
        query,
        nextContinuationToken,
        (err, result) => {
          if (err) {
            log.error(`Error fetching counters for ${serial}: ${err}`);
            return reject(err);
          }
          log.info(`Success fetching counters for ${serial}.`);

          nextContinuationToken = result.continuationToken;
          const values = result.entries
            .map((entry) => deconstructTableServiceResult<RawRecord>(entry))
            .map(
              ({ Timestamp, ...rest }): CounterRecord => ({
                Timestamp: new Date(Timestamp),
                ...rest,
              }),
            );
          resolve(values);
        },
      ),
    );

    results.push(...pageResults);

    pageNumber += 1;
  }

  return results;
};
