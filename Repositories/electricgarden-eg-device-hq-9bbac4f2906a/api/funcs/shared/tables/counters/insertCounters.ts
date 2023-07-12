import { Logger } from "@azure/functions";
import { TableBatch, TableUtilities } from "azure-storage";
import { CounterValue } from "../../records";
import { createTableService } from "../tableService";
import { COUNTERS_TABLE_NAME } from "./constants";

const entGen = TableUtilities.entityGenerator;

const MAX_DATE = new Date().setFullYear(2200, 0, 1);

// use this to make records come back in reverse date order
// because no order by in table storage (ht https://alexandrebrisebois.wordpress.com/2013/03/01/storing-windows-azure-storage-table-entities-in-descending-order/)
const getReverseTime = (timestamp: Date) => MAX_DATE - timestamp.getTime();

export const insertCounters = async (
  log: Logger,
  serial: string,
  receivedOn: Date,
  values: CounterValue[],
  encodingVersion = 0,
) => {
  const tableService = createTableService();

  const records = values.map(({ type, value }) => ({
    PartitionKey: entGen.String(serial),
    RowKey: entGen.String(
      `${serial}_${getReverseTime(receivedOn)}_${type}_${Math.round(
        Math.random() * 1000,
      )}`,
    ),
    Serial: entGen.String(serial),
    ReceivedOn: entGen.DateTime(receivedOn),
    EncodingVersion: entGen.Int32(encodingVersion),
    Type: entGen.Int32(type),
    Value: entGen.Int32(value),
  }));

  const batch = new TableBatch();
  for (const record of records) {
    batch.insertEntity(record, {});
  }

  return new Promise((resolve, reject) =>
    tableService.executeBatch(COUNTERS_TABLE_NAME, batch, (err) => {
      if (err) {
        log.error(`Failed to insert ${records.length} counters`);
        return reject(err);
      }
      // log.info(`Success inserting`, records);
      log.info(`Success inserting ${records.length} counters`);
      resolve();
    }),
  );
};
