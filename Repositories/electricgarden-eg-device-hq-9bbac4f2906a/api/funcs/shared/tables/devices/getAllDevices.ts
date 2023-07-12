import { Logger } from "@azure/functions";
import azure from "azure-storage";
import { DeviceInfo } from "../../records";
import {
  createTableService,
  deconstructTableServiceResult,
} from "../tableService";
import { DEVICES_TABLE_NAME } from "./constants";
import { DeviceInfoRecord, mapRecordToInfo } from "./record";

export const getAllDevices = (log: Logger): Promise<DeviceInfo[]> => {
  const query = new azure.TableQuery();

  const nextContinuationToken: any = null; // may need this with more devices
  return new Promise((resolve, reject) =>
    createTableService().queryEntities(
      DEVICES_TABLE_NAME,
      query,
      nextContinuationToken,
      (err, result) => {
        if (err) {
          log.error(`Error fetching all devices: ${err}`);
          return reject(err);
        }
        if (result.continuationToken) {
          log.warn(
            `Continuation token received fetching devices. Too many devices! Need to change code to support paging.`,
          );
        }
        log.info(`Success fetching all devices.`);
        resolve(
          result.entries
            .map((entry) =>
              deconstructTableServiceResult<DeviceInfoRecord>(entry),
            )
            .map(mapRecordToInfo),
        );
      },
    ),
  );
};
