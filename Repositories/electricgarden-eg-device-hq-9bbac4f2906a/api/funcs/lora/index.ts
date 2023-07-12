import { azureHttpFuncForEventHub } from "../shared";
import { convert } from "./convert";
import { registerDeviceMappingCreate } from "./registerDeviceMapping";
import { getSerialFromDeviceIdCreate } from "./getSerialFromDeviceId";
import { InvalidPayloadError, InvalidRequestError } from "./errors";

export default azureHttpFuncForEventHub("lora", async ({ log }, req) => {
  try {
    if (
      !(
        req.body &&
        req.body.DevEUI_uplink &&
        req.body.DevEUI_uplink.payload_hex
      )
    ) {
      const message = "No data or no DevEUI_uplink payload in request.";
      log.info("Incomplete request body:", req.body);
      throw new InvalidRequestError(message);
    }

    const messages = await convert(req.body, {
      getSerialFromDeviceId: getSerialFromDeviceIdCreate(log),
      registerDeviceMapping: registerDeviceMappingCreate(log),
    });

    log("Sending messages to event hub: ", JSON.stringify(messages));

    return {
      messagesToEventHub: messages,
      res: {
        status: 202, // Accepted
        body: { success: "Data received" },
      },
    };
  } catch (error) {
    if (
      error instanceof InvalidRequestError ||
      error instanceof InvalidPayloadError
    ) {
      const { name, message } = error;
      log.warn(`Invalid lora request rejected. ${name}; ${message}`);
      return {
        messagesToEventHub: [],
        res: {
          status: 400,
          body: {
            error: name,
            message,
          },
        },
      };
    }
    throw error;
  }
});
