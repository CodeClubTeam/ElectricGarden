import * as yup from "yup";

export const errorPayloadValidator = yup
  .object()
  .shape({
    message: yup.string().required(),
    traceback: yup.string(),
  })
  .required();
