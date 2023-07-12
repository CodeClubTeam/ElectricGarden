import { Logger } from "@azure/functions";
import azure from "azure-storage";
import { AuditLogRecord } from "../../records";
import {
  createTableService,
  deconstructTableServiceResult,
} from "../tableService";
import { AUDIT_LOG_TABLE_NAME } from "./constants";

type Criteria = Partial<Pick<AuditLogRecord, "type" | "createdOn">>;

type ContinuationToken = azure.TableService.TableContinuationToken;

export type QueryAuditLogOptions = Criteria & {
  continuationToken?: ContinuationToken;
  limit?: number;
};

interface Entry {
  type: string;
  createdOn: Date;
  content?: unknown;
}

type Result = {
  entries: Entry[];
  continuationToken?: ContinuationToken;
};

export const queryAuditLog = (
  log: Logger,
  serial: string,
  { continuationToken, limit, ...criteria }: QueryAuditLogOptions = {},
): Promise<Result> => {
  let query = new azure.TableQuery()
    .where("PartitionKey eq ?", serial)
    .select(["type", "createdOn", "content"]);
  if (limit !== undefined) {
    query = query.top(limit);
  }
  for (const [name, value] of Object.entries(criteria)) {
    query = query.and(`${name} eq ?`, value);
  }

  return new Promise((resolve, reject) =>
    createTableService().queryEntities<Entry>(
      AUDIT_LOG_TABLE_NAME,
      query,
      continuationToken as any,
      (err, result) => {
        if (err) {
          log.error(`Error fetching audit log records for ${serial}: ${err}`);
          return reject(err);
        }
        log.info(`Success fetching audit log records for ${serial}.`);

        return resolve({
          ...result,
          entries: result.entries
            .map((entry) => deconstructTableServiceResult<Entry>(entry))
            .map(({ type, createdOn, content }) => ({
              type,
              createdOn,
              content:
                typeof content === "string" ? JSON.parse(content) : undefined,
            })),
        });
      },
    ),
  );
};
