import { SendTimeMessage } from "../shared";

const toHex = (value: number) => value.toString(16).toUpperCase();

const toLeftPaddedHex = (value: number, padCount: number) =>
  toHex(value).padStart(padCount, "0");

export const encodeSendTime = ({
  content: { offsets },
}: SendTimeMessage): string =>
  `${toLeftPaddedHex(8, 2)}${toLeftPaddedHex(
    offsets.device,
    4,
  )}${toLeftPaddedHex(offsets.received, 4)}`;
