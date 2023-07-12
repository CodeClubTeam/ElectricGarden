import { Logger } from "@azure/functions";
import { logger } from "@azure/storage-blob";
import { getRequiredSetting } from "../getRequiredSetting";

import { DeviceInfo } from "../records";
import { getCard, getTrello } from "./shared";

export const setErrorLabelOnTrelloCard = async (
  log: Logger,
  { trelloCardId: cardId }: DeviceInfo,
) => {
  if (!cardId) {
    log.warn("No trello card id, skipping adding of error label");
    return;
  }
  log.info(`Adding error label to card: ${cardId}.`);

  const card = await getCard(cardId);
  const labelId = getRequiredSetting("TRELLO_DEVICE_ERRORS_LABEL_ID");
  if (
    !(card?.labels ?? []).find((label: { id: string }) => label.id === labelId)
  ) {
    log.info(`Label not found on card: ${cardId}; adding.`);
    const trello = getTrello();
    await trello.addLabelToCard(cardId, labelId);
  } else {
    log.info(`Label already found on card: ${cardId}; skipping add.`);
  }
};
