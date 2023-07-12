import { azureHttpFunc } from "../shared";
import { handleGetAll, handleGet } from "./get";
import { handlePatch } from "./patch";

export default azureHttpFunc("devices", async (context, req) => {
  switch (req.method) {
    case "GET":
      if (!req.params.serial) {
        return handleGetAll(context.log, req.query);
      } else {
        return handleGet(context, req);
      }

    case "PATCH":
      return handlePatch(context, req);

    default:
      throw new Error(`Method ${req.method} not implemented/supported.`);
  }
});
