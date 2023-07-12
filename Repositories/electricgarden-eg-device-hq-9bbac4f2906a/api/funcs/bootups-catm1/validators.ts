import * as yup from "yup";

export const payloadValidator = yup
  .object({
    firmware: yup.string().required(),
    hardware: yup.string().required(),
  })
  .required();
