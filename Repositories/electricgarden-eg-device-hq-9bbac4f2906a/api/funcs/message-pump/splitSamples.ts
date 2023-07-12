import { SampleMessage } from "../shared";

export const splitSamples = (message: SampleMessage): SampleMessage[] =>
  message.content.length > 1
    ? message.content.map(
        (sample): SampleMessage => ({ ...message, content: [sample] }),
      )
    : [message];

export const splitSamplesMulti = (messages: SampleMessage[]): SampleMessage[] =>
  messages.map(splitSamples).flat();
