import shortid from "shortid";
import { SendInstructionsMessage } from "../messageTypes";

export const createSendInstructionsMessage = (
  serial: string,
  settings: SendInstructionsMessage["content"]["settings"],
  timeSync?: SendInstructionsMessage["content"]["timeSync"],
): SendInstructionsMessage => ({
  id: shortid(),
  type: "sendinstructions",
  serial,
  timestamp: new Date(),
  content: {
    settings,
    timeSync,
  },
});
