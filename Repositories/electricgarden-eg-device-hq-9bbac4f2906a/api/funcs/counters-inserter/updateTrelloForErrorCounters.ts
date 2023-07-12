import { Logger } from "@azure/functions";
import {
  setErrorLabelOnTrelloCard,
  CounterValue,
  getCounterByType,
  getDeviceInfo,
} from "../shared";

export const updateTrelloForAnyErrorCounters = async (
  log: Logger,
  serial: string,
  values: CounterValue[],
  encodingVersion = 1,
) => {
  const counterDefinitions = values.map((value) =>
    getCounterByType(value.type, encodingVersion),
  );
  const errorCounterDefinitions = counterDefinitions.filter((c) => !!c.error);
  if (errorCounterDefinitions.length === 0) {
    log.info(
      `No error counters received.`,
      counterDefinitions.map((d) => d.name),
    );
    return;
  }
  log.info(
    `Error counters received. Attempting to add label on trello card`,
    errorCounterDefinitions.map((d) => d.name),
  );
  const device = await getDeviceInfo(log, serial);
  if (device) {
    await setErrorLabelOnTrelloCard(log, device);
  }
};
