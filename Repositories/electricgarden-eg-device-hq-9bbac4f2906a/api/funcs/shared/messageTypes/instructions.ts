import { MessageWithContent, TimeSyncMinuteOfDays } from "./shared";
import { DeviceSettings } from "../device-settings";

export interface SendInstructionsMessage
  extends MessageWithContent<{
    settings?: Partial<DeviceSettings>;
    timeSync?: TimeSyncMinuteOfDays;
  }> {
  type: "sendinstructions";
}
