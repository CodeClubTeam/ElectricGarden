import { MessageWithContent } from "./shared";

export interface SendTimeMessage
  extends MessageWithContent<{
    deviceId: string;
    offsets: {
      device: number;
      received: number;
    };
  }> {
  type: "sendtime";
}
