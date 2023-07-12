import { MessageWithContent, TimeSyncMinuteOfDays } from "./shared";

export interface BootupMessage
  extends MessageWithContent<{
    deviceType: "lora" | "catm1";
    firmware: string;
    hardware: string;
    externalId?: string;
    timeSync?: TimeSyncMinuteOfDays;
  }> {
  type: "bootup";
}
