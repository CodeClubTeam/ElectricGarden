import { Logger } from "@azure/functions";
import {
  createTableService,
  deconstructTableServiceResult,
  isNotFoundError,
} from "../tableService";
import { LoraDeviceRecord, LORA_DEVICES_TABLE_NAME } from "./shared";

export const getLoraDeviceSerialByLoraDeviceId = (
  log: Logger,
  loraDeviceId: string,
): Promise<string | undefined> => {
  return new Promise((resolve, reject) =>
    createTableService().retrieveEntity<LoraDeviceRecord>(
      LORA_DEVICES_TABLE_NAME,
      loraDeviceId,
      loraDeviceId,
      (err, result) => {
        if (err) {
          if (isNotFoundError(err)) {
            return resolve(undefined);
          }
          log.error(`Error fetching lora devices for ${loraDeviceId}: ${err}`);
          return reject(err);
        }
        log.info(`Success fetching lora devices for ${loraDeviceId}.`);

        if (!result) {
          return resolve(undefined);
        }
        resolve(deconstructTableServiceResult<LoraDeviceRecord>(result).serial);
      },
    ),
  );
};
