import { azureAsyncFunc, SendTimeMessage } from "../shared";
import { sendTime } from "./sendTime";

export default azureAsyncFunc(
  "lora-sendtime",
  async ({ log }, sendTimeMessage: SendTimeMessage) => {
    log(JSON.stringify(sendTimeMessage));

    await sendTime(log, sendTimeMessage);
  },
);
