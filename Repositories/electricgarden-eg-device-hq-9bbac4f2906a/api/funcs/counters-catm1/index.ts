import shortid from "shortid";
import { ValidationError } from "yup";
import {
  azureHttpFuncForEventHub,
  CountersMessage,
  paramsWithSerialValidator,
} from "../shared";
import { convertPayload } from "./convertPayload";

export default azureHttpFuncForEventHub(
  "catm1-counters",
  async ({ log }, req) => {
    const { serial } = paramsWithSerialValidator.validateSync(req.params);
    const rawPayload = req.body;

    if (typeof rawPayload !== "string") {
      throw new ValidationError("payload expected to be a string", "", "");
    }

    const { counters, encodingVersion } = convertPayload(rawPayload);

    const message: CountersMessage = {
      type: "counters",
      serial,
      timestamp: new Date(),
      id: shortid(),
      source: "device",
      content: {
        encodingVersion,
        values: counters,
      },
    };

    log(
      `Enqueued counters (encoding version: ${encodingVersion}): '${JSON.stringify(
        message,
      )}'".`,
    );

    return {
      messagesToEventHub: [message],
      res: {
        status: 204,
        body: undefined,
      },
    };
  },
);
