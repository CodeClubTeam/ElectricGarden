import { Context } from "@azure/functions";
import { archiveActions } from "../../shared";

export const handleDeleteActions = async (context: Context, serial: string) => {
  context.log.info(`Received delete (archive) of actions for ${serial}.`);

  await archiveActions(context.log, serial);

  return {
    res: {
      status: 204,
      body: undefined,
    },
  };
};
