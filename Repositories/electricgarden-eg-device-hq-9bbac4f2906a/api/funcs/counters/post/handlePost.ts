import { Context } from "@azure/functions";
import * as yup from "yup";
import { insertCounters } from "../../shared";

const payloadValidator = yup
  .array(
    yup
      .object({
        type: yup.number().required(),
        value: yup.number().required(),
      })
      .required(),
  )
  .required();

export const handlePost = async ({ log, req }: Context, serial: string) => {
  if (!req) {
    throw new Error("no request");
  }

  const values = payloadValidator.validateSync(req.body);
  log.info(`Received counters for ${serial}: "${JSON.stringify(values)}".`);
  const receivedOn = new Date();

  await insertCounters(log, serial, receivedOn, values);
  return {
    res: {
      status: 204,
      body: undefined,
    },
  };
};
