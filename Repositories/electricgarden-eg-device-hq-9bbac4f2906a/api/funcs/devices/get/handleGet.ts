import { Context, HttpRequest } from "@azure/functions";
import { getDeviceInfo, paramsWithSerialValidator } from "../../shared";

export const handleGet = async (context: Context, req: HttpRequest) => {
  context.log.info(`Received request of all devices.`);
  const { serial } = paramsWithSerialValidator.validateSync(req.params);

  const device = await getDeviceInfo(context.log, serial);
  if (!device) {
    return {
      res: {
        status: 404,
        body: undefined,
      },
    };
  }

  return {
    res: {
      status: 200,
      body: device,
    },
  };
};
