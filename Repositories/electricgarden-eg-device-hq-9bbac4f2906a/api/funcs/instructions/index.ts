import * as yup from "yup";
import { azureHttpFunc } from "../shared";
import { handleDeleteActions } from "./delete";
import { handleGet } from "./get";
import { handlePostAction } from "./post";
import { handlePutActions, handlePutSettings } from "./put";
import { InstructionsResponse, InstructionsBindings } from "./shared";

const paramsSchema = yup
  .object({
    serial: yup.string().required(),
    aspect: yup
      .string()
      .default("all")
      .oneOf(["actions", "settings", "all"])
      .required(),
  })
  .required();

export default azureHttpFunc<InstructionsBindings>(
  "instructions",
  async (context, req): Promise<InstructionsResponse> => {
    const { serial, aspect } = paramsSchema.validateSync(req.params);

    switch (req.method) {
      case "GET":
        return handleGet(context, serial, aspect);

      case "PUT":
        switch (aspect) {
          case "actions":
            return handlePutActions(context, serial, req.body);

          case "settings":
            return handlePutSettings(context, serial, req.body);

          default:
            throw new yup.ValidationError(
              "Specify /actions or /settings to PUT to.",
              "",
              "",
            );
        }

      case "POST":
        switch (aspect) {
          case "actions":
            return handlePostAction(context, serial, req.body);

          case "settings":
            throw new yup.ValidationError("Update settings via PUT", "", "");

          default:
            throw new yup.ValidationError(
              "Specify /actions to POST to.",
              "",
              "",
            );
        }

      case "DELETE":
        switch (aspect) {
          case "actions":
            return handleDeleteActions(context, serial);

          case "settings":
            throw new yup.ValidationError("Cannot delete settings.", "", "");

          default:
            throw new yup.ValidationError(
              "Specify /actions to DELETE.",
              "",
              "",
            );
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
