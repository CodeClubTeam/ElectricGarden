import { Logger } from "@azure/functions";

import { DeviceInfo } from "../records";
import { getTrello } from "./shared";

export const updateTrelloCardDue = async (
  log: Logger,
  device: DeviceInfo,
  due: Date,
) => {
  if (!device.trelloCardId) {
    log.warn("No trello card id, skipping update of due date");
    return;
  }

  log.info(`Updating due date on card: ${device.trelloCardId} to ${due}.`);
  const trello = getTrello();
  await trello.updateCard(device.trelloCardId, "due", due.toISOString());
};
