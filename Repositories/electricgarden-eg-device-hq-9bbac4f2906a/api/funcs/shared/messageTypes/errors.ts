import { MessageWithContent } from "./shared";

export interface ErrorsMessage
  extends MessageWithContent<{ message: string; traceback?: string }> {
  type: "error";
}
