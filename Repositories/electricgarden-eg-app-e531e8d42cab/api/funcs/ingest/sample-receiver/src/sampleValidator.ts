import * as yup from 'yup';
import { Sample } from './types';

export const sampleValidator = yup
  .object<Sample>()
  .shape({
    timestamp: yup
      .date()
      .required()
      .transform((v) => new Date(v)),
    probeSoilTemp: yup.number().notRequired(),
    probeAirTemp: yup.number().notRequired(),
    probeMoisture: yup.number().notRequired(),
    ambientTemp: yup.number().notRequired(),
    ambientHumidity: yup.number().notRequired(),
    batteryVoltage: yup.number().notRequired(),
    rssi: yup.number().notRequired(),
    light: yup.number().notRequired(),
    co2: yup.number().notRequired(),
    snr: yup.number().notRequired(),
    errorCodes: yup.number().notRequired(),
  })
  .required();
