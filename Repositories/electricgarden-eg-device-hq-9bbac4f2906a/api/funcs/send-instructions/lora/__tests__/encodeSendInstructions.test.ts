import {
  createSendInstructionsMessage,
  LoraDeviceSettings,
} from "../../../shared";
import { TimeSyncMinuteOfDays } from "../../../shared/messageTypes/shared";
import { encodeSendInstructions } from "../encodeSendInstructions";

const serial = "ABC123";

describe("encodeSendInstructions", () => {
  describe("full set of settings", () => {
    let output: string;

    const settings: LoraDeviceSettings = {
      Wakeup: 0x12,
      TransmitFreq: 0x13,
      TransmitSize: 0x14,
      MaxTransmits: 0x15,
      MaxRetries: 0x16,
      TimeFreq: 0x17,
      CountersFreq: 0x18,
      TimeSync: 0x19,
      LocalMode: 0x01,
      LocalFreq: 0x10,
      LocalPeriod: 0x20,
    };

    describe("without timeSync", () => {
      beforeEach(() => {
        output = encodeSendInstructions(
          createSendInstructionsMessage(serial, settings),
        );
      });

      it("output should match expected", () => {
        expect(output).toBe("07ffffffff0012131415161700180019011020"); // ffffffff means got nothing
      });
    });

    describe("with timeSync", () => {
      const timeSync: TimeSyncMinuteOfDays = {
        device: 0x120,
        clock: 0x500,
      };

      beforeEach(() => {
        output = encodeSendInstructions(
          createSendInstructionsMessage(serial, settings, timeSync),
        );
      });

      it("output should match expected", () => {
        expect(output).toBe("07012005000012131415161700180019011020");
      });
    });
  });
});
