import type {
  BootupMessage,
  CountersMessage,
  SampleMessage,
  ErrorsMessage,
  SendInstructionsMessage,
  SendTimeMessage,
} from "../messageTypes";

export type Message =
  | BootupMessage
  | CountersMessage
  | SampleMessage
  | ErrorsMessage
  | SendInstructionsMessage
  | SendTimeMessage;

export * from "../messageTypes";
