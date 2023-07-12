import { ValidationError } from "yup";
import {
  azureHttpFuncForEventHub,
  getDeviceHasSettingsToUpdateFlag,
  SampleMessage,
} from "../shared";
import { convert } from "./convert";
import { createSampleMessageCreate } from "./createSampleMessage";
import { getDateISOStringLocaltime } from "./getDateISOStringLocaltime";

interface SuccessResponse {
  res: {
    status: 201 | 301;
    body: {
      serial: string;
      count: number;
      ts: string;
      message?: string;
    };
  };
  messagesToEventHub: SampleMessage[];
}

export default azureHttpFuncForEventHub(
  "catm1-samples",
  async (context, req): Promise<SuccessResponse> => {
    if (!req.body) {
      throw new ValidationError("Invalid request, no payload.", "", "");
    } else if (typeof req.body !== "string") {
      throw new ValidationError("Payload not a string.", "", "");
    }

    context.log(`Received payload: "${req.body}"`);

    const samplesWithSerial = convert(req.body);
    const { serial, samples } = samplesWithSerial;
    if (samples.length === 0) {
      throw new ValidationError("Payload could not be parsed.", "", "");
    }

    const message = createSampleMessageCreate(context.log)(samplesWithSerial);
    if (message.content.length === 0) {
      throw new ValidationError("Payload had no valid samples.", "", "");
    }

    const body = {
      serial,
      count: message.content.length,
      ts: getDateISOStringLocaltime(new Date()),
    };

    context.log(message);

    if (
      serial &&
      (await getDeviceHasSettingsToUpdateFlag(context.log, serial))
    ) {
      return {
        messagesToEventHub: [message],
        res: {
          status: 301,
          body: {
            ...body,
            message: "Settings/Actions available",
          },
        },
      };
    }

    return {
      messagesToEventHub: [message],
      res: {
        status: 201,
        body,
      },
    };
  },
);
