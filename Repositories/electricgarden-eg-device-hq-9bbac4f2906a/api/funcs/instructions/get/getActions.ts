import { Logger } from "@azure/functions";
import { getActionRecords, Action } from "../../shared";

export type GetActions = (log: Logger, serial: string) => Promise<Action[]>;

export const getActions: GetActions = async (log, serial) => {
  const actionRecords = await getActionRecords(log, serial);

  return actionRecords.map(({ Type, Payload }) => {
    const result: Action = { type: Type };
    if (Payload !== undefined && typeof Payload === "string") {
      result.payload = JSON.parse(Payload);
    }
    return result;
  });
};
