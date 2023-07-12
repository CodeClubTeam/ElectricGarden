import { Context, HttpRequest } from "@azure/functions";
import shortid from "shortid";
import {
  azureHttpFuncForEventHub,
  BootupMessage,
  paramsWithSerialValidator,
} from "../shared";
import { payloadValidator } from "./validators";

export default azureHttpFuncForEventHub(
  "bootups-catm1",
  async (context: Context, req: HttpRequest) => {
    const { serial } = paramsWithSerialValidator.validateSync(req.params);
    const payload = payloadValidator.validateSync(req.body);

    context.log(`Bootup from ${serial}: ${JSON.stringify(payload)}`);

    const { firmware, hardware } = payload;

    const message: BootupMessage = {
      type: "bootup",
      serial,
      timestamp: new Date(),
      id: shortid(),
      source: "device",
      content: {
        firmware,
        hardware,
        deviceType: "catm1",
      },
    };

    return {
      messagesToEventHub: [message],
      res: {
        status: 204,
        body: undefined,
      },
    };
  },
);
