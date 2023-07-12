import azure, { StorageError } from "azure-storage";
import memoize from "lodash/memoize";
import { getRequiredSetting } from "../getRequiredSetting";

export const createTableService = memoize(() =>
  azure.createTableService(
    getRequiredSetting("STORAGE_ACCOUNT"),
    getRequiredSetting("STORAGE_ACCOUNT_KEY"),
  ),
);

// hack for weird result from table lookups and query results
export const deconstructTableServiceResult = <T>(record: any): T =>
  Object.entries(record).reduce((result, [name, value]) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    result[name] = value._;
    return result;
  }, {} as T);

export const isNotFoundError = (error: Error) =>
  error.name === "StorageError" && (error as StorageError).statusCode === 404;
