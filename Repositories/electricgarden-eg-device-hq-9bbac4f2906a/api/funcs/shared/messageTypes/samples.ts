import { Sample } from "../samples";
import { MessageWithContent } from "./shared";

export interface SampleMessage extends MessageWithContent<Sample[]> {
  type: "sample";
}
