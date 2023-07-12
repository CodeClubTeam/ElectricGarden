import { MessageWithContent } from "./shared";
import { CounterValue } from "../records";

export interface CountersMessage
  extends MessageWithContent<{
    encodingVersion: number;
    values: CounterValue[];
  }> {
  type: "counters";
}
