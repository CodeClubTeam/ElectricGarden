import { LoraDeviceSettings, SendInstructionsMessage } from "../../shared";

/* 
(Wakeup (2b), TransmitFreq(1b), TransmitSize(1b), MaxTransmits(1b), MaxRetries(1b), TimeFreq(1b), 
CountersFreq(2b),BatterySleep(2b), TimeSync(2b) (total of 14 bytes). 
*/

type OrderItem = { name: keyof LoraDeviceSettings; bytes?: number };

// NOTE: order is important for encoding, only add new ones to the end for backward compatibility
// NOTE: you can remove entries if LORA doesn't support a setting type and it will simply be left out
const ORDERED_LORA_SETTINGS: OrderItem[] = [
  {
    name: "Wakeup",
    bytes: 2,
  },
  {
    name: "TransmitFreq",
  },
  {
    name: "TransmitSize",
  },
  {
    name: "MaxTransmits",
  },
  {
    name: "MaxRetries",
  },
  {
    name: "TimeFreq",
  },
  {
    name: "CountersFreq",
    bytes: 2,
  },
  {
    name: "TimeSync",
    bytes: 2,
  },
  {
    name: "LocalMode",
  },
  {
    name: "LocalFreq",
  },
  {
    name: "LocalPeriod",
  },
];

const TYPE = 0x07;

const toHex = (value: number) => value.toString(16);

const toLeftPaddedHex = (value: number, bytes = 1) =>
  toHex(value).padStart(bytes * 2, "0");

const oneByteHex = (value: number) => toLeftPaddedHex(value);

const twoByteHex = (value: number) => toLeftPaddedHex(value, 2);

export const encodeSendInstructions = ({
  content: { settings, timeSync },
}: SendInstructionsMessage): string => {
  if (!settings) {
    throw new Error(`No settings to send to device.`);
  }
  const values = ORDERED_LORA_SETTINGS.map(({ name, bytes }) => {
    const setting = settings[name];
    if (setting === undefined) {
      throw new Error(`Setting missing: ${name}.`);
    }
    if (typeof setting !== "number") {
      throw new Error(`Expected numeric settings only on lora settings.`);
    }
    return toLeftPaddedHex(setting, bytes);
  });

  const typeHex = oneByteHex(TYPE);

  const timeSyncValues = [
    twoByteHex(timeSync?.device ?? 0xffff),
    twoByteHex(timeSync?.clock ?? 0xffff),
  ];

  return [typeHex, ...timeSyncValues, ...values].join("");
};
