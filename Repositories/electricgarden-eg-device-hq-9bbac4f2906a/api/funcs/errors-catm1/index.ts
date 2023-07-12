import shortid from "shortid";
import {
  azureHttpFuncForEventHub,
  ErrorsMessage,
  paramsWithSerialValidator,
} from "../shared";
import { errorPayloadValidator } from "./validators";

export default azureHttpFuncForEventHub(
  "errors-catm1",
  async (context, req) => {
    const { serial } = paramsWithSerialValidator.validateSync(req.params);

    const error = errorPayloadValidator.validateSync(req.body);

    context.log.info(
      `Received error from ${serial}: ${JSON.stringify(error)}.`,
    );

    const message: ErrorsMessage = {
      type: "error",
      serial: serial,
      timestamp: new Date(),
      source: "device",
      id: shortid(),
      content: error,
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
