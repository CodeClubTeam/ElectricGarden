import * as yup from "yup";
import {
  azureHttpFunc,
  getSampleRelayDefaultEndpointTemplate,
  getSampleRelayEndpointTemplate,
  setSampleRelayEndpointTemplate,
} from "../shared";

const paramsSchema = yup
  .object({
    serial: yup.string().notRequired(),
  })
  .required();

const settingsSchema = yup
  .object({
    endPoint: yup.string(),
  })
  .required();

export default azureHttpFunc("sample-relay-settings", async ({ log }, req) => {
  const { serial } = paramsSchema.validateSync(req.params);
  switch (req.method) {
    case "GET": {
      const endPoint = serial
        ? await getSampleRelayEndpointTemplate(log, serial)
        : getSampleRelayDefaultEndpointTemplate();
      log.info(
        `Fetching sample relay settings for: ${
          serial ? `serial: ${serial}` : "default"
        }`,
      );
      return {
        res: {
          status: 200,
          body: {
            serial: serial ?? "DEFAULT",
            settings: {
              endPoint,
            },
          },
        },
      };
    }

    case "PUT": {
      if (!serial) {
        throw new yup.ValidationError(
          "Default sample relay settings are readonly",
          "",
          "",
        );
      }
      log.info(
        `Saving new sample endpoint settings for device type: ${serial}`,
      );

      const { endPoint } = settingsSchema.validateSync(req.body);

      await setSampleRelayEndpointTemplate(log, serial, endPoint);

      return {
        res: {
          status: 204,
          body: undefined,
        },
      };
    }

    default:
      return {
        res: {
          status: 405,
          body: undefined,
        },
      };
  }
});
