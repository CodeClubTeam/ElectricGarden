import { CounterRecord, CounterValue } from "./counters";

export const mapCountersToRecord = (
  serial: string,
  receivedOn: Date,
  counters: CounterValue[],
  encodingVersion = 0,
): CounterRecord[] => {
  const timestamp = new Date();
  return counters.map(
    (counter): CounterRecord => ({
      PartitionKey: serial,
      RowKey: `${serial}_${receivedOn.getTime()}_${counter.type}`,
      Serial: serial,
      Timestamp: timestamp, // think azure storage table may write over this
      ReceivedOn: receivedOn, // doesn't get put in as a date (!)
      EncodingVersion: encodingVersion,
      Type: counter.type,
      Value: counter.value,
    }),
  );
};
