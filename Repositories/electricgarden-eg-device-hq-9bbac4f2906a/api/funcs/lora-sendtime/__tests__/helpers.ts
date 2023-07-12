import shortid from "shortid";
import { SendTimeMessage } from "../../shared";

export const createSendTimeMessage = (
  offsets: SendTimeMessage["content"]["offsets"],
): SendTimeMessage => ({
  type: "sendtime",
  timestamp: new Date(),
  serial: "ABC123",
  id: shortid(),
  content: {
    deviceId: "123",
    offsets,
  },
});
