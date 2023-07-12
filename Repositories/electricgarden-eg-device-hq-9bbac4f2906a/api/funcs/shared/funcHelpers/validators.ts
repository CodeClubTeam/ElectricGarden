import * as yup from "yup";

export const paramsWithSerialValidator = yup
  .object({
    serial: yup.string().required(),
  })
  .required();
