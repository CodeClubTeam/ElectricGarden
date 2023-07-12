import * as yup from "yup";
import { QueryAuditLogOptions } from "../shared";

export const optionsSchema = yup
  .object<QueryAuditLogOptions>({
    limit: yup.number().default(20).required(),
    createdOn: yup
      .date()
      .notRequired()
      .transform((str) => new Date(str)), // this doesn't seem to work in a table query
    type: yup.string().notRequired(),
    continuationToken: yup.object(), // this is super awkward from azure tables. not a "token" but a json object!
  })
  .default({})
  .notRequired();
