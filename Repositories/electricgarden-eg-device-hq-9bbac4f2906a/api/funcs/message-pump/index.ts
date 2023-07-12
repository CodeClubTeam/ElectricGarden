import { Context } from "@azure/functions";
import {
  azureAsyncFunc,
  BootupMessage,
  CountersMessage,
  ErrorsMessage,
  Message,
  SampleMessage,
  SendInstructionsMessage,
  SendTimeMessage,
} from "../shared";
import { splitSamplesMulti } from "./splitSamples";

const filterByTypeCreate = <T extends Message>(type: T["type"]) => (
  messages: Message[],
) => messages.filter((m): m is T => m.type === type);

const extractOfTypeCreate = <T extends Message>(type: T["type"]) => {
  const filterByType = filterByTypeCreate(type);
  return (log: Context["log"], messages: Message[]) => {
    const filteredMessages = filterByType(messages);
    for (const message of filteredMessages) {
      log(
        `"${type}" type message received for queuing ${JSON.stringify(
          message,
        )}`,
      );
    }
    return filteredMessages;
  };
};

const filterForSamples = filterByTypeCreate<SampleMessage>("sample");
const extractErrors = extractOfTypeCreate<ErrorsMessage>("error");
const extractBootups = extractOfTypeCreate<BootupMessage>("bootup");
const extractCounters = extractOfTypeCreate<CountersMessage>("counters");
const extractSendInstructions = extractOfTypeCreate<SendInstructionsMessage>(
  "sendinstructions",
);
const extractClockUpdates = extractOfTypeCreate<SendTimeMessage>("sendtime");
const extractAuditedMessages = (messages: Message[]) =>
  messages.filter((message: Message) => message.type !== "sample");

interface Result {
  samplesQueue: SampleMessage[];
  errorsQueue: ErrorsMessage[];
  bootupsQueue: BootupMessage[];
  countersQueue: CountersMessage[];
  instructionsQueue: SendInstructionsMessage[];
  clockUpdatesQueue: SendTimeMessage[];
  auditLogQueue: Message[];
  sampleMetricsQueue: SampleMessage[];
}

export default azureAsyncFunc<Result>(
  "message-pump",
  async ({ log }, messages: Message[]) => {
    const samplesQueue = splitSamplesMulti(filterForSamples(messages));
    samplesQueue.forEach((sample) => {
      log.info("Sample queued " + JSON.stringify(sample));
    });

    return {
      samplesQueue,
      errorsQueue: extractErrors(log, messages),
      bootupsQueue: extractBootups(log, messages),
      countersQueue: extractCounters(log, messages),
      instructionsQueue: extractSendInstructions(log, messages),
      clockUpdatesQueue: extractClockUpdates(log, messages),
      auditLogQueue: extractAuditedMessages(messages),
      sampleMetricsQueue: samplesQueue,
    };
  },
);
