import { ValidationError } from "yup";
import { azureHttpFunc, paramsWithSerialValidator } from "../shared";
import { handleDelete } from "./delete";
import { handleGet } from "./get";
import { handlePost } from "./post";

export default azureHttpFunc("counters", async (context, req) => {
  if (!req) {
    throw new ValidationError("No request content", "", "");
  }

  const { serial } = paramsWithSerialValidator.validateSync(req.params);

  switch (req.method) {
    case "GET":
      return handleGet(context, serial);
    case "POST":
      return handlePost(context, serial);
    case "DELETE":
      return handleDelete(context, serial);
    default:
      throw new Error(`Method ${req.method} not supported`);
  }
});
