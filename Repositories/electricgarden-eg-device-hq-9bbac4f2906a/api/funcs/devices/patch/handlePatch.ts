import { HttpRequest, Context } from "@azure/functions";
import {
  paramsWithSerialValidator,
  getDeviceInfo,
  upsertDevice,
} from "../../shared";
import { patchSchema } from "./patchSchema";

export const handlePatch = async ({ log }: Context, req: HttpRequest) => {
  const { serial } = paramsWithSerialValidator.validateSync(req.params);

  const device = await getDeviceInfo(log, serial);
  if (!device) {
    return {
      res: {
        status: 404,
        body: undefined,
      },
    };
  }

  const { appSamplesEndpointOverride } = patchSchema.validateSync(req.body);
  if (appSamplesEndpointOverride) {
    const updated = { ...device, appSamplesEndpointOverride };

    await upsertDevice(log, updated);
  }

  return {
    res: {
      status: 204,
      body: undefined,
    },
  };
};
