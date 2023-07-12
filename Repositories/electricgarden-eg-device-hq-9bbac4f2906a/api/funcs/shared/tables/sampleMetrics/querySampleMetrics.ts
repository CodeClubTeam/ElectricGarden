import { Logger } from "@azure/functions";
import azure from "azure-storage";
import {
  createTableService,
  deconstructTableServiceResult,
} from "../tableService";
import { SAMPLE_METRICS_TABLE_NAME } from "./constants";
import { mapRecordToMetric, SampleMetricRecord } from "./record";

export interface SampleMetricsCriteria {
  lastReceived?: {
    from?: Date;
    to?: Date;
  };
}

const buildTableQuery = (criteria: SampleMetricsCriteria) => {
  const query = new azure.TableQuery();
  if (criteria.lastReceived) {
    const { from, to } = criteria.lastReceived;
    if (from && to) {
      return query
        .where("lastReceived ge ?date?", from)
        .and("lastReceived le ?date?", to);
    } else if (from) {
      return query.where("lastReceived ge ?date?", from);
    } else if (to) {
      return query.where("lastReceived le ?date?", to);
    }
  }
  return query;
};

const runQuery = (log: Logger, query: azure.TableQuery): Promise<unknown[]> => {
  const nextContinuationToken: any = null; // may need this with more devices
  return new Promise((resolve, reject) =>
    createTableService().queryEntities(
      SAMPLE_METRICS_TABLE_NAME,
      query,
      nextContinuationToken,
      (err, result) => {
        if (err) {
          log.error(`Error fetching metrics: ${err}`);
          return reject(err);
        }
        log.info(`Success fetching metrics.`);
        resolve(result.entries);
      },
    ),
  );
};

export const querySampleMetrics = async (
  log: Logger,
  criteria: SampleMetricsCriteria = {},
) => {
  const query = buildTableQuery(criteria);
  const entries = await runQuery(log, query);
  return entries
    .map((entry) => deconstructTableServiceResult<SampleMetricRecord>(entry))
    .map(mapRecordToMetric);
};
