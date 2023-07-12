import { Logger } from "@azure/functions";
import { DeviceInfo } from "../../records";
import {
  createTableService,
  deconstructTableServiceResult,
  isNotFoundError,
} from "../tableService";
import { DEVICES_TABLE_NAME } from "./constants";
import { DeviceInfoRecord, mapRecordToInfo } from "./record";

export const getDeviceInfo = (
  log: Logger,
  serial: string,
): Promise<DeviceInfo | undefined> => {
  return new Promise((resolve, reject) =>
    createTableService().retrieveEntity<DeviceInfoRecord>(
      DEVICES_TABLE_NAME,
      serial,
      serial,
      {},
      (err, result) => {
        if (err) {
          if (isNotFoundError(err)) {
            return resolve(undefined);
          }
          log.error(`Error fetching device with ${serial}: ${err}`);
          return reject(err);
        }
        log.info(`Success fetching device with ${serial}.`);
        if (!result) {
          return resolve(undefined);
        }

        resolve(
          mapRecordToInfo(
            deconstructTableServiceResult<DeviceInfoRecord>(result),
          ),
        );
      },
    ),
  );
};
