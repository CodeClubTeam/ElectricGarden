import { Message } from "../messages";
import { MessageSource } from "../messageTypes/shared";

export interface AuditLog {
  createdOn: Date;
  serial: string;
  type: string;
  source?: MessageSource;
  id: string;
  content?: unknown;
}

export interface AuditLogRecord extends AuditLog {
  PartitionKey: string;
  RowKey: string;
  Timestamp?: string;
}

const MAX_DATE = new Date().setFullYear(2200, 0, 1);

// use this to make records come back in reverse date order
// because no order by in table storage (ht https://alexandrebrisebois.wordpress.com/2013/03/01/storing-windows-azure-storage-table-entities-in-descending-order/)
const getReverseTime = (timestamp: Date) => MAX_DATE - timestamp.getTime();

export const mapMessageToAuditLogRecord = ({
  serial,
  type,
  timestamp: timestampMightBeStr,
  id,
  ...rest
}: Message): AuditLogRecord => {
  const timestamp = new Date(timestampMightBeStr);
  return {
    PartitionKey: serial,
    RowKey: `${serial}_${getReverseTime(timestamp)}_${type}_${id}`,
    serial: serial,
    type: type,
    id,
    createdOn: timestamp,
    ...rest,
  };
};
