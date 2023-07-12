import * as yup from "yup";

export const actionSchema = yup
  .object({
    type: yup.string().required(),
    payload: yup.object<Record<string, unknown>>({}).notRequired(),
  })
  .required();

export const actionsValidator = yup.array(actionSchema).min(0).defined(); // defined instead of required as allow empty array
