import * as yup from "yup";
import { InferType } from "yup";

export const sampleSchema = yup
  .object({
    timestamp: yup
      .date()
      .required()
      .transform((d) => new Date(d)),
    airTemp: yup.number().notRequired(),
    soilTemp: yup.number().notRequired(),
    soilMoisture: yup.number().notRequired(),
    humidity: yup.number().notRequired(),
    light: yup.number().notRequired(),
    battery: yup.number().notRequired(),
    errorCode: yup.number().notRequired(),
    rssi: yup.number().notRequired(),
    snr: yup.number().notRequired(),
    co2: yup.number().notRequired(),
  })
  .required();

export const payloadSchema = yup
  .object({
    serial: yup.string().required(),
    samples: yup
      .array(sampleSchema)
      .required()
      .min(1, "At least one sample must be included"),
  })
  .required();

export type Payload = InferType<typeof payloadSchema>;

export type InputSample = InferType<typeof sampleSchema>;
