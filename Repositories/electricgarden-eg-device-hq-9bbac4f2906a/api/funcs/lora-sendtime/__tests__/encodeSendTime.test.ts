import { encodeSendTime } from "../encodeSendTime";
import { createSendTimeMessage } from "./helpers";

describe("encodeSendTime", () => {
  test("offsets of 9 and 23", () => {
    expect(
      encodeSendTime(createSendTimeMessage({ device: 9, received: 23 })),
    ).toBe("0800090017");
  });
});
