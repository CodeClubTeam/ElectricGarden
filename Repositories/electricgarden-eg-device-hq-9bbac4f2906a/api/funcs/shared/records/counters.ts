export interface Counter {
  Serial: string;
  ReceivedOn: Date;
  EncodingVersion: number;
  Type: number;
  Value: number;
}

export interface CounterRecord extends Counter {
  PartitionKey: string;
  RowKey: string;
  Timestamp?: Date;
}

export type CounterValue = {
  type: number;
  value: number;
};
