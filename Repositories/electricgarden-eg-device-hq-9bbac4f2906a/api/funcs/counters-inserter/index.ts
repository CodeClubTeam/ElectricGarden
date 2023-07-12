import { azureAsyncFunc, CountersMessage, insertCounters } from "../shared";
import { updateTrelloForAnyErrorCounters } from "./updateTrelloForErrorCounters";

export default azureAsyncFunc(
  "counters-inserter",
  async ({ log }, countersMessage: CountersMessage) => {
    log("Inserting counters", countersMessage);

    const {
      serial,
      timestamp,
      content: { encodingVersion, values },
    } = countersMessage;

    await insertCounters(
      log,
      serial,
      new Date(timestamp),
      values,
      encodingVersion,
    );

    try {
      await updateTrelloForAnyErrorCounters(
        log,
        serial,
        values,
        encodingVersion,
      );
    } catch (error) {
      log.warn(`Failed to update trello for any error counters`, error);
    }
  },
);
