import { SampleMessage } from "../../messages";

export interface SampleMetric {
  serial: string;
  lastReceived: Date;
  content: string;
}

export type SampleMetricRecord = SampleMetric & {
  PartitionKey: string;
  RowKey: string;
  Timestamp?: string;
};

export const mapSampleMessageToInfo = ({
  serial,
  timestamp,
  content,
}: SampleMessage): SampleMetricRecord => ({
  PartitionKey: serial,
  RowKey: serial,
  serial,
  lastReceived: new Date(timestamp),
  content: JSON.stringify(content),
});

export const mapRecordToMetric = ({
  serial,
  lastReceived,
  content,
}: SampleMetricRecord): SampleMetric => ({
  serial,
  lastReceived,
  content: JSON.parse(content),
});
