import { azureAsyncFunc, ErrorsMessage } from "../shared";
import { reportError } from "./reportError";

export default azureAsyncFunc(
  "error-relay",
  async (context, { serial, content: error }: ErrorsMessage) => {
    context.log.info(
      `Relaying error from ${serial} to raygun: ${JSON.stringify(error)}.`,
    );
    await reportError(serial, error.message, error.traceback);
  },
);
