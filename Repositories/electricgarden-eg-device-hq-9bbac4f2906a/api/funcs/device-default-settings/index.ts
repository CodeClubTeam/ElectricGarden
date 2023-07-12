import * as yup from "yup";
import {
  azureHttpFunc,
  DeviceInfo,
  getAllSchemaForDeviceType,
  getDefaultDeviceSettings,
  putDeviceDefaultSettings,
} from "../shared";

const paramsSchema = yup
  .object({
    type: yup.string<DeviceInfo["type"]>().required().oneOf(["lora", "catm1"]),
  })
  .required();

export default azureHttpFunc(
  "device-default-settings",
  async ({ log }, req) => {
    const { type } = paramsSchema.validateSync(req.params);
    switch (req.method) {
      case "GET": {
        log.info(`Fetching default settings for device type: ${type}`);
        return {
          res: {
            status: 200,
            body: await getDefaultDeviceSettings(type),
          },
        };
      }

      case "PUT": {
        log.info(`Saving new default settings for device type: ${type}`);
        const schema = getAllSchemaForDeviceType(type);
        const settings = schema.validateSync(req.body);
        await putDeviceDefaultSettings(type, settings);
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
  },
);
