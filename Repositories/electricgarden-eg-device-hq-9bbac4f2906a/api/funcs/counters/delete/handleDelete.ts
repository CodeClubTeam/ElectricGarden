import { Context } from "@azure/functions";
import { deleteCounters } from "../../shared";

export const handleDelete = async (context: Context, serial: string) => {
  context.log.info(`Received delete request for counters of ${serial}:`);

  await deleteCounters(context.log, serial);

  return {
    res: {
      status: 204,
      body: undefined,
    },
  };
};
